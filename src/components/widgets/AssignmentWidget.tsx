'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAssignments, createAssignment, updateAssignment, deleteAssignment, getSB } from '@/lib/api'
import { addLog } from '@/lib/logs';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { addXpGlobal } from '@/hooks/useXp';

interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
}

export default function AssignmentWidget() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    deadline: (() => {
      const d = new Date();
      d.setHours(d.getHours() + 14);
      return d.toISOString().slice(0, 16);
    })(),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments'],
    queryFn: getAssignments,
  });

  // Poll every 3 seconds to catch AI-created items
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    }, 3000)
    return () => clearInterval(interval)
  }, [queryClient])

  const createMutation = useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setShowForm(false);
      setNewAssignment({ title: '', description: '', deadline: '' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateAssignment(id, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const assignment = assignments.find((a: Assignment) => a.id === id);
      if (assignment) {
        addLog({ original_id: id, type: 'assignment' as const, title: assignment.title, description: assignment.description, data: assignment })
          .catch(e => console.error('Failed to add log (delete will continue):', e));
      }
      return deleteAssignment(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] }),
    onError: (error) => {
      console.error('Delete failed:', error);
    }
  });



  return (
    <div className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Assignments
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-1 hover:bg-white/10 rounded"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showForm && (
        <div className="mb-4 space-y-3 p-3 bg-[#111113] rounded-lg">
          <input
            type="text"
            placeholder="Assignment title"
            value={newAssignment.title}
            onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
            className="w-full bg-[#0B0B0C] border border-white/10 rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Description"
            value={newAssignment.description}
            onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
            className="w-full bg-[#0B0B0C] border border-white/10 rounded-lg px-3 py-2 text-sm resize-none"
            rows={2}
          />
          <input
            type="datetime-local"
            value={newAssignment.deadline}
            onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
            className="w-full bg-[#0B0B0C] border border-white/10 rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={() => createMutation.mutate(newAssignment)}
            disabled={!newAssignment.title || !newAssignment.deadline}
            className="w-full bg-white/80 text-black rounded-lg py-2 text-sm font-medium hover:bg-white disabled:opacity-50"
          >
            Add Assignment
          </button>
        </div>
      )}

      <div className="space-y-3">
          {assignments.map((assignment: Assignment) => {
          // Parse deadline as local time - datetime-local input gives local time
          const deadlineStr = assignment.deadline;
          const [datePart, timePart] = deadlineStr.split('T');
          const [yearStr, monthStr, dayStr] = datePart.split('-');
          const [hourStr, minuteStr] = timePart.split(':');
          const deadlineLocal = new Date(
            parseInt(yearStr), 
            parseInt(monthStr) - 1, 
            parseInt(dayStr), 
            parseInt(hourStr), 
            parseInt(minuteStr)
          ).getTime();
          
          const now = Date.now();
          const hoursLeft = (deadlineLocal - now) / (1000 * 60 * 60);
          const minutesLeft = Math.floor((hoursLeft - Math.floor(hoursLeft)) * 60);
          const hoursLeftInt = Math.floor(hoursLeft);
          const isUrgent = hoursLeft < 24 && hoursLeft > 0;
          return (
            <div
              key={assignment.id}
              className={`p-3 rounded-lg border transition-colors ${
                isUrgent
                  ? 'bg-[#111113] border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                  : 'bg-[#111113] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 font-medium">
                    {assignment.title}
                  </p>
                  {assignment.description && (
                    <p className="text-xs text-gray-400 mt-1">{assignment.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs text-gray-400">
                       {hoursLeft > 0 
                         ? `${hoursLeftInt}h ${minutesLeft}m left`
                         : 'Overdue'}
                     </span>
                    {isUrgent && (
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(assignment.id)}
                  className="p-1 hover:bg-red-500/20 rounded"
                >
                  <Trash2 className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
