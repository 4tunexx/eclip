'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { MISSION_REQUIREMENT_TYPE_OPTIONS } from '@/lib/constants/requirement-types';

interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  isDaily: boolean;
  requirementType?: string;
  requirementValue?: number;
  objectiveValue: number;
  rewardXp: number;
  rewardCoins: string;
  isActive: boolean;
}

export default function MissionsAdmin() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Mission>>({
    category: 'PLATFORM',
    isDaily: false,
    requirementType: 'KILLS',
    requirementValue: 1,
    objectiveValue: 1,
    rewardXp: 100,
    rewardCoins: '0',
  });

  useEffect(() => {
    fetchMissions();
  }, []);

  async function fetchMissions() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/missions');
      if (!res.ok) throw new Error('Failed to fetch missions');
      const data = await res.json();
      setMissions(data);
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

      const url = editingId ? `/api/admin/missions/${editingId}` : '/api/admin/missions';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save mission');

      await fetchMissions();
      setFormData({
        category: 'PLATFORM',
        isDaily: false,
        requirementType: 'KILLS',
        requirementValue: 1,
        objectiveValue: 1,
        rewardXp: 100,
        rewardCoins: '0',
      });
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this mission?')) return;

    try {
      const res = await fetch(`/api/admin/missions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete mission');
      await fetchMissions();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  function handleEdit(mission: Mission) {
    setFormData(mission);
    setEditingId(mission.id);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Missions Management</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>}

      {/* Form */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">{editingId ? 'Edit' : 'Create'} Mission</h2>

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
            <SelectItem value="DAILY">Daily</SelectItem>
            <SelectItem value="PLATFORM">Platform</SelectItem>
            <SelectItem value="INGAME">In-Game</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={formData.requirementType || 'KILLS'}
          onValueChange={(val) => setFormData({ ...formData, requirementType: val })}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select requirement type" />
          </SelectTrigger>
          <SelectContent>
            {MISSION_REQUIREMENT_TYPE_OPTIONS.map((option) => (
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
          placeholder="Objective Value"
          type="number"
          value={formData.objectiveValue || 1}
          onChange={(e) => setFormData({ ...formData, objectiveValue: parseInt(e.target.value) })}
          className="bg-gray-800 border-gray-700"
        />

        <Input
          placeholder="Reward XP"
          type="number"
          value={formData.rewardXp || 100}
          onChange={(e) => setFormData({ ...formData, rewardXp: parseInt(e.target.value) })}
          className="bg-gray-800 border-gray-700"
        />

        <Input
          placeholder="Reward Coins"
          type="number"
          value={formData.rewardCoins || '0'}
          onChange={(e) => setFormData({ ...formData, rewardCoins: e.target.value })}
          className="bg-gray-800 border-gray-700"
        />

        <div className="flex gap-2">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            {editingId ? 'Update' : 'Create'} Mission
          </Button>
          {editingId && (
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  category: 'PLATFORM',
                  isDaily: false,
                  requirementType: 'KILLS',
                  requirementValue: 1,
                  objectiveValue: 1,
                  rewardXp: 100,
                  rewardCoins: '0',
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
      <div className="border rounded-lg overflow-x-auto">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Requirement</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">XP</TableHead>
                <TableHead className="text-right">Coins</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {missions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No missions yet. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                missions.map((mission) => (
                  <TableRow key={mission.id}>
                    <TableCell className="font-medium max-w-xs truncate">{mission.title}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                        {mission.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{mission.requirementType || 'N/A'}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{mission.requirementValue || mission.objectiveValue}</TableCell>
                    <TableCell className="text-right">{mission.rewardXp}</TableCell>
                    <TableCell className="text-right">{mission.rewardCoins}</TableCell>
                    <TableCell className="text-center">
                      {mission.isActive ? (
                        <span className="text-green-600 dark:text-green-400">✓</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        onClick={() => handleEdit(mission)}
                        size="sm"
                        variant="outline"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(mission.id)}
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
