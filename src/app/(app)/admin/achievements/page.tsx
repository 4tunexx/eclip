'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ACHIEVEMENT_REQUIREMENT_TYPE_OPTIONS } from '@/lib/constants/requirement-types';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  requirementType?: string;
  requirementValue?: number;
  metricType?: string;
  progressRequired: number;
  isRepeatable: boolean;
  isActive: boolean;
}

export default function AchievementsAdmin() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Achievement>>({
    category: 'LEVEL',
    requirementType: 'LEVEL_REACH',
    requirementValue: 1,
    progressRequired: 1,
    isRepeatable: false,
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  async function fetchAchievements() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/achievements');
      if (!res.ok) throw new Error('Failed to fetch achievements');
      const data = await res.json();
      setAchievements(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (!formData.title || !formData.description) {
        setError('Title and description are required');
        return;
      }

      const url = editingId ? `/api/admin/achievements/${editingId}` : '/api/admin/achievements';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save achievement');

      await fetchAchievements();
      setFormData({
        category: 'LEVEL',
        requirementType: 'LEVEL_REACH',
        requirementValue: 1,
        progressRequired: 1,
        isRepeatable: false,
      });
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this achievement?')) return;

    try {
      const res = await fetch(`/api/admin/achievements/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete achievement');
      await fetchAchievements();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  function handleEdit(achievement: Achievement) {
    setFormData(achievement);
    setEditingId(achievement.id);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Achievements Management</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>}

      {/* Form */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">{editingId ? 'Edit' : 'Create'} Achievement</h2>

        <Input
          placeholder="Title"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="bg-gray-800 border-gray-700"
        />

        <Input
          placeholder="Description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-gray-800 border-gray-700"
        />

        <Select
          value={formData.category}
          onValueChange={(val) => setFormData({ ...formData, category: val })}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LEVEL">Level</SelectItem>
            <SelectItem value="ESR">ESR</SelectItem>
            <SelectItem value="COMBAT">Combat</SelectItem>
            <SelectItem value="SOCIAL">Social</SelectItem>
            <SelectItem value="PLATFORM">Platform</SelectItem>
            <SelectItem value="COMMUNITY">Community</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={formData.requirementType || 'LEVEL_REACH'}
          onValueChange={(val) => setFormData({ ...formData, requirementType: val })}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select requirement type" />
          </SelectTrigger>
          <SelectContent>
            {ACHIEVEMENT_REQUIREMENT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Requirement Value"
          type="number"
          value={formData.requirementValue || 1}
          onChange={(e) =>
            setFormData({ ...formData, requirementValue: parseInt(e.target.value) || 1 })
          }
          className="bg-gray-800 border-gray-700"
        />

        <Input
          placeholder="Progress Required"
          type="number"
          value={formData.progressRequired || 1}
          onChange={(e) => setFormData({ ...formData, progressRequired: parseInt(e.target.value) })}
          className="bg-gray-800 border-gray-700"
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isRepeatable || false}
            onChange={(e) => setFormData({ ...formData, isRepeatable: e.target.checked })}
            className="w-4 h-4"
          />
          <label>Is Repeatable</label>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            {editingId ? 'Update' : 'Create'} Achievement
          </Button>
          {editingId && (
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  category: 'LEVEL',
                  requirementType: 'LEVEL_REACH',
                  requirementValue: 1,
                  progressRequired: 1,
                  isRepeatable: false,
                });
              }}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 bg-gray-800">
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Requirement Type</TableHead>
              <TableHead>Requirement Value</TableHead>
              <TableHead>Repeatable</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {achievements.map((achievement) => (
              <TableRow key={achievement.id} className="border-gray-800">
                <TableCell className="font-medium">{achievement.title}</TableCell>
                <TableCell>
                  <span className="bg-purple-900 text-purple-200 px-2 py-1 rounded text-sm">
                    {achievement.category}
                  </span>
                </TableCell>
                <TableCell className="text-sm">
                  <span className="bg-purple-800 text-purple-100 px-2 py-1 rounded">
                    {achievement.requirementType || achievement.metricType || 'N/A'}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-sm">{achievement.requirementValue || achievement.progressRequired}</TableCell>
                <TableCell>{achievement.isRepeatable ? '✅' : '❌'}</TableCell>
                <TableCell>{achievement.isActive ? '✅' : '❌'}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    onClick={() => handleEdit(achievement)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(achievement.id)}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
