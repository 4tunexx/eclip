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
import { BADGE_REQUIREMENT_TYPE_OPTIONS } from '@/lib/constants/requirement-types';

interface Badge {
  id: string;
  title: string;
  description: string;
  rarity: string;
  requirementType: string;
  requirementValue?: string;
  imageUrl?: string;
  isActive: boolean;
}

export default function BadgesAdmin() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Badge>>({
    rarity: 'COMMON',
    requirementType: 'ACHIEVEMENT_UNLOCK',
    requirementValue: '',
  });

  useEffect(() => {
    fetchBadges();
  }, []);

  async function fetchBadges() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/badges');
      if (!res.ok) throw new Error('Failed to fetch badges');
      const data = await res.json();
      setBadges(data);
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

      const url = editingId ? `/api/admin/badges/${editingId}` : '/api/admin/badges';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save badge');

      await fetchBadges();
      setFormData({
        rarity: 'COMMON',
        requirementType: 'ACHIEVEMENT_UNLOCK',
        requirementValue: '',
      });
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this badge?')) return;

    try {
      const res = await fetch(`/api/admin/badges/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete badge');
      await fetchBadges();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  function handleEdit(badge: Badge) {
    setFormData(badge);
    setEditingId(badge.id);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Badges Management</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>}

      {/* Form */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">{editingId ? 'Edit' : 'Create'} Badge</h2>

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
          value={formData.rarity}
          onValueChange={(val) => setFormData({ ...formData, rarity: val })}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select rarity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="COMMON">Common</SelectItem>
            <SelectItem value="RARE">Rare</SelectItem>
            <SelectItem value="EPIC">Epic</SelectItem>
            <SelectItem value="LEGENDARY">Legendary</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={formData.requirementType || 'ACHIEVEMENT_UNLOCK'}
          onValueChange={(val) => setFormData({ ...formData, requirementType: val })}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select requirement type" />
          </SelectTrigger>
          <SelectContent>
            {BADGE_REQUIREMENT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Requirement Value (e.g., achievement ID or cosmetic ID)"
          value={formData.requirementValue || ''}
          onChange={(e) => setFormData({ ...formData, requirementValue: e.target.value })}
          className="bg-gray-800 border-gray-700"
        />

        <Input
          placeholder="Image URL"
          value={formData.imageUrl || ''}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          className="bg-gray-800 border-gray-700"
        />

        <div className="flex gap-2">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            {editingId ? 'Update' : 'Create'} Badge
          </Button>
          {editingId && (
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  rarity: 'COMMON',
                  requirementType: 'ACHIEVEMENT_UNLOCK',
                  requirementValue: '',
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
              <TableHead>Rarity</TableHead>
              <TableHead>Requirement Type</TableHead>
              <TableHead>Requirement Value</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {badges.map((badge) => (
              <TableRow key={badge.id} className="border-gray-800">
                <TableCell className="font-medium">{badge.title}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-sm font-semibold ${
                      badge.rarity === 'LEGENDARY'
                        ? 'bg-yellow-900 text-yellow-200'
                        : badge.rarity === 'EPIC'
                        ? 'bg-purple-900 text-purple-200'
                        : badge.rarity === 'RARE'
                        ? 'bg-blue-900 text-blue-200'
                        : 'bg-gray-700 text-gray-200'
                    }`}
                  >
                    {badge.rarity}
                  </span>
                </TableCell>
                <TableCell className="text-sm">
                  <span className="bg-orange-900 text-orange-200 px-2 py-1 rounded">
                    {badge.requirementType}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-sm">{badge.requirementValue || '—'}</TableCell>
                <TableCell>{badge.isActive ? '✅' : '❌'}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    onClick={() => handleEdit(badge)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(badge.id)}
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
