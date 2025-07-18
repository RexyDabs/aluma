'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Checkbox } from '../../components/ui/checkbox';
import RoleBasedAccess from '../../components/RoleBasedAccess';

interface User {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  created_at: string;
}

interface Role {
  id: string;
  name: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
  role?: Role;
}

const roleColors: Record<string, string> = {
  'admin': 'bg-red-100 text-red-800',
  'manager': 'bg-purple-100 text-purple-800',
  'technician': 'bg-blue-100 text-blue-800',
  'subcontractor': 'bg-orange-100 text-orange-800',
  'staff': 'bg-gray-100 text-gray-800',
};

const rolePermissions: Record<string, string[]> = {
  'admin': ['All access', 'User management', 'Financial reports', 'System settings'],
  'manager': ['Lead management', 'Job oversight', 'Team management', 'Basic reports'],
  'technician': ['Assigned jobs', 'Task management', 'Time logging', 'Job reports'],
  'subcontractor': ['Assigned jobs', 'Task completion', 'Time logging'],
  'staff': ['Basic access', 'Assigned tasks'],
};

function UsersPageContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  async function fetchUsersAndRoles() {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('name');
      
      // Fetch user roles
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          *,
          role:roles(*)
        `);

      if (usersError || rolesError || userRolesError) {
        setError(usersError?.message || rolesError?.message || userRolesError?.message || 'Unknown error');
      } else {
        setUsers(usersData || []);
        setRoles(rolesData || []);
        setUserRoles(userRolesData || []);
      }
    } catch (err) {
      setError('Failed to fetch data');
    }
    
    setLoading(false);
  }

  async function handleUpdateUserRole(userId: string, newRole: string) {
    setUpdatingUser(userId);
    
    try {
      // Update user's role
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Update user roles table
      const role = roles.find(r => r.name === newRole);
      if (role) {
        // Remove existing roles for this user
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
        
        // Add new role
        await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role_id: role.id
          });
      }

      // Refresh data
      await fetchUsersAndRoles();
      setEditDialogOpen(false);
      setEditingUser(null);
    } catch (err) {
      setError('Failed to update user role');
    }
    
    setUpdatingUser(null);
  }

  async function handleToggleUserStatus(userId: string, currentStatus: boolean) {
    setUpdatingUser(userId);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ active: !currentStatus })
        .eq('id', userId);
      
      if (error) {
        setError(error.message);
      } else {
        await fetchUsersAndRoles();
      }
    } catch (err) {
      setError('Failed to update user status');
    }
    
    setUpdatingUser(null);
  }

  // Filter users based on search, role, and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || roleFilter === 'all-roles' || user.role === roleFilter;
    const matchesStatus = !statusFilter || statusFilter === 'all-statuses' || 
      (statusFilter === 'active' && user.active) ||
      (statusFilter === 'inactive' && !user.active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get role counts for stats
  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activeUsers = users.filter(u => u.active).length;
  const totalUsers = users.length;

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage team members and their access levels</p>
        </div>
        <Button variant="outline" onClick={fetchUsersAndRoles}>
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{totalUsers}</div>
          <div className="text-gray-600">Total Users</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
          <div className="text-gray-600">Active Users</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{roles.length}</div>
          <div className="text-gray-600">Roles</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">{Object.keys(roleCounts).length}</div>
          <div className="text-gray-600">Role Types</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Search Users</Label>
            <Input
              id="search"
              placeholder="Name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="role-filter">Filter by Role</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-roles">All roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name} ({roleCounts[role.name] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status-filter">Filter by Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-statuses">All statuses</SelectItem>
                <SelectItem value="active">Active ({activeUsers})</SelectItem>
                <SelectItem value="inactive">Inactive ({totalUsers - activeUsers})</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all-roles');
                setStatusFilter('all-statuses');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-500">Loading users...</div>
        ) : error ? (
          <div className="p-6 text-red-500">Error: {error}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-gray-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500">
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={roleColors[user.role] || 'bg-gray-100 text-gray-800'}>
                        {user.role}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {rolePermissions[user.role]?.slice(0, 2).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {user.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Dialog open={editDialogOpen && editingUser?.id === user.id} onOpenChange={setEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUser(user)}
                            >
                              Edit Role
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User Role</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>User</Label>
                                <div className="text-sm text-gray-600 mt-1">
                                  {user.full_name} ({user.email})
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="role-select">Role</Label>
                                <Select 
                                  value={editingUser?.role || ''} 
                                  onValueChange={(value) => setEditingUser(prev => prev ? {...prev, role: value} : null)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roles.map(role => (
                                      <SelectItem key={role.id} value={role.name}>
                                        <div>
                                          <div className="font-medium">{role.name}</div>
                                          <div className="text-xs text-gray-500">
                                            {rolePermissions[role.name]?.join(', ')}
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {editingUser?.role && (
                                <div>
                                  <Label>Permissions</Label>
                                  <div className="text-sm text-gray-600 mt-1">
                                    <ul className="list-disc list-inside space-y-1">
                                      {rolePermissions[editingUser.role]?.map(permission => (
                                        <li key={permission}>{permission}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditDialogOpen(false);
                                  setEditingUser(null);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => editingUser && handleUpdateUserRole(editingUser.id, editingUser.role)}
                                disabled={updatingUser === editingUser?.id}
                              >
                                {updatingUser === editingUser?.id ? 'Updating...' : 'Update Role'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="sm"
                          variant={user.active ? "destructive" : "default"}
                          onClick={() => handleToggleUserStatus(user.id, user.active)}
                          disabled={updatingUser === user.id}
                        >
                          {updatingUser === user.id ? 'Updating...' : (user.active ? 'Deactivate' : 'Activate')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Role Permissions Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Role Permissions Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(rolePermissions).map(([role, permissions]) => (
            <div key={role} className="border rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={roleColors[role] || 'bg-gray-100 text-gray-800'}>
                  {role}
                </Badge>
                <span className="text-sm text-gray-500">
                  ({roleCounts[role] || 0} users)
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                {permissions.map(permission => (
                  <li key={permission} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    {permission}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function UsersPage() {
  return (
    <RoleBasedAccess requiredRole="admin">
      <UsersPageContent />
    </RoleBasedAccess>
  );
} 