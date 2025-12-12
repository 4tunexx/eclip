/**
 * Admin Role Manager Component
 * Allows admins to manage user roles with visual feedback
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAssignableRoles, getRoleConfig } from '@/lib/role-config';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  roleColor?: string;
  level: number;
  esr: number;
}

interface AdminRoleManagerProps {
  user: User;
  onRoleChange?: (updatedUser: User) => void;
}

export function AdminRoleManager({ user, onRoleChange }: AdminRoleManagerProps) {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const assignableRoles = getAssignableRoles();
  const currentRoleConfig = getRoleConfig(selectedRole);

  async function handleRoleAssignment() {
    if (selectedRole === user.role) {
      setError('Please select a different role');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }

      const data = await response.json();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Notify parent component
      if (onRoleChange && data.user) {
        onRoleChange(data.user);
      }

      // Update local state
      setSelectedRole(selectedRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Role Manager</span>
          <span 
            className="text-xs px-2 py-1 rounded text-white"
            style={{ backgroundColor: currentRoleConfig.color }}
          >
            {currentRoleConfig.icon} {currentRoleConfig.nickname}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current User Info */}
        <div className="p-3 bg-secondary rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold text-sm">{user.username}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
          <div className="flex gap-4 text-sm">
            <span>Level: {user.level}</span>
            <span>ESR: {user.esr}</span>
            <span>Current Role: <strong>{user.role}</strong></span>
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Assign New Role</label>
          <Select value={selectedRole} onValueChange={setSelectedRole} disabled={loading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assignableRoles.map((role) => {
                const roleConfig = getRoleConfig(role);
                return (
                  <SelectItem key={role} value={role}>
                    <span className="flex items-center gap-2">
                      {roleConfig.icon} {roleConfig.nickname} ({roleConfig.description})
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Role Preview */}
        {selectedRole !== user.role && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium mb-2">Role Preview:</p>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">Color: </span>
                <span 
                  className="inline-block w-6 h-6 rounded border"
                  style={{ backgroundColor: currentRoleConfig.color }}
                  title={currentRoleConfig.color}
                />
                <span className="ml-2">{currentRoleConfig.color}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Description: </span>
                <span>{currentRoleConfig.description}</span>
              </div>
              {currentRoleConfig.badge && (
                <div className="text-green-600 dark:text-green-400">✓ Will receive role badge</div>
              )}
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Role updated successfully! User will see changes on next login.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        <Button 
          onClick={handleRoleAssignment}
          disabled={loading || selectedRole === user.role}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Updating...' : 'Assign Role'}
        </Button>

        {/* Info Text */}
        <p className="text-xs text-muted-foreground">
          When a role is assigned, the user will automatically receive the associated role color 
          and nickname formatting. Changes take effect on next login.
        </p>
      </CardContent>
    </Card>
  );
}
