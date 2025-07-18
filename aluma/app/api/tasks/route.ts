import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, status, priority, category_id, due_date, estimated_hours, notes, is_recurring, recurrence_pattern, assigned_to, tags, created_by } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!created_by) {
      return NextResponse.json({ error: 'Created by is required' }, { status: 400 });
    }

    // Create the task
    const taskData = {
      title: title.trim(),
      description: description?.trim() || null,
      status: status || 'todo',
      priority: priority || 'medium',
      category_id: category_id || null,
      due_date: due_date || null,
      estimated_hours: estimated_hours ? parseFloat(estimated_hours) : null,
      notes: notes?.trim() || null,
      is_recurring: is_recurring || false,
      recurrence_pattern: recurrence_pattern || null,
      assigned_to: assigned_to && assigned_to.length > 0 ? assigned_to : null,
      created_by,
    };

    const { data: task, error: taskError } = await supabase
      .from('global_tasks')
      .insert(taskData)
      .select()
      .single();

    if (taskError) {
      console.error('Task creation error:', taskError);
      return NextResponse.json({ error: taskError.message }, { status: 500 });
    }

    // Add tags if provided
    if (tags && tags.length > 0 && task) {
      const tagAssignments = tags.map((tagId: string) => ({
        task_id: task.id,
        tag_id: tagId,
      }));

      const { error: tagError } = await supabase
        .from('global_task_tags')
        .insert(tagAssignments);

      if (tagError) {
        console.error('Tag assignment error:', tagError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({ 
      success: true, 
      task,
      message: 'Task created successfully' 
    });

  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const assigned_to = searchParams.get('assigned_to');
    const created_by = searchParams.get('created_by');

    let query = supabase
      .from('global_tasks')
      .select(`
        *,
        task_categories(*),
        global_task_tags(
          task_tags(*)
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category_id', category);
    }
    if (assigned_to) {
      query = query.contains('assigned_to', [assigned_to]);
    }
    if (created_by) {
      query = query.eq('created_by', created_by);
    }

    const { data: tasks, error } = await query;

    if (error) {
      console.error('Task fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map tags to a more convenient format
    const mappedTasks = (tasks || []).map((task: any) => ({
      ...task,
      tags: (task.global_task_tags || []).map((gt: any) => gt.task_tags),
    }));

    return NextResponse.json({ 
      success: true, 
      tasks: mappedTasks 
    });

  } catch (error) {
    console.error('Task fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 