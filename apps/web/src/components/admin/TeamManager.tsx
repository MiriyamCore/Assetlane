import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { LoaderCircle, Trash2, UserPlus } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import type { AuthUser, TeamMember, UserRole } from '../../types/store';
import { InlineError, SuccessInline } from '../ui/States';

const roleLabels: Record<UserRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  viewer: 'Viewer (read-only)',
};

export function TeamManager({ currentUser }: { currentUser: AuthUser }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [busyMemberId, setBusyMemberId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [creating, setCreating] = useState(false);

  const canManageTeam = currentUser.role === 'owner';

  const loadMembers = async () => {
    const response = await apiFetch<{ members: TeamMember[] }>('/team');
    setMembers(response.members);
  };

  useEffect(() => {
    loadMembers()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load team members.');
      })
      .finally(() => setLoading(false));
  }, []);

  const createMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError('');
    setSuccessMessage('');

    try {
      await apiFetch('/team', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });
      setEmail('');
      setPassword('');
      setRole('admin');
      await loadMembers();
      setSuccessMessage('Team member added.');
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to add team member.');
    } finally {
      setCreating(false);
    }
  };

  const updateRole = async (memberId: string, nextRole: UserRole) => {
    setBusyMemberId(memberId);
    setError('');
    setSuccessMessage('');

    try {
      await apiFetch(`/team/${memberId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: nextRole }),
      });
      await loadMembers();
      setSuccessMessage('Team member updated.');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update team member.');
    } finally {
      setBusyMemberId('');
    }
  };

  const removeMember = async (member: TeamMember) => {
    setBusyMemberId(member.id);
    setError('');
    setSuccessMessage('');

    try {
      await apiFetch(`/team/${member.id}`, { method: 'DELETE' });
      await loadMembers();
      setSuccessMessage('Team member removed.');
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to remove team member.');
    } finally {
      setBusyMemberId('');
    }
  };

  if (loading) {
    return <p className="theme-meta">Loading team members…</p>;
  }

  return (
    <div className="team-manager">
      {error ? <InlineError message={error} /> : null}
      {successMessage ? <SuccessInline message={successMessage} /> : null}

      <div className="team-member-list">
        {members.map((member) => (
          <div key={member.id} className="team-member-row">
            <div>
              <strong>{member.email}</strong>
              <span className="theme-meta">
                {roleLabels[member.role]}
                {member.id === currentUser.id ? ' · you' : ''}
              </span>
            </div>
            {canManageTeam && member.id !== currentUser.id ? (
              <div className="team-member-actions">
                <select
                  disabled={busyMemberId === member.id}
                  value={member.role}
                  onChange={(event) => void updateRole(member.id, event.target.value as UserRole)}
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  className="secondary-button danger-button"
                  disabled={busyMemberId === member.id}
                  type="button"
                  onClick={() => void removeMember(member)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <span className="subtle-chip">{roleLabels[member.role]}</span>
            )}
          </div>
        ))}
      </div>

      {canManageTeam ? (
        <form className="team-invite-form" onSubmit={createMember}>
          <div className="team-invite-header">
            <UserPlus size={16} />
            <strong>Add team member</strong>
          </div>
          <div className="form-grid">
            <label>
              Email
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label>
              Temporary password
              <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <label>
              Role
              <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer (read-only)</option>
              </select>
            </label>
          </div>
          <button className="primary-button" disabled={creating} type="submit">
            {creating ? <LoaderCircle className="spin" size={16} /> : null}
            <span>{creating ? 'Adding…' : 'Add member'}</span>
          </button>
        </form>
      ) : (
        <div className="settings-note-card">
          <strong>Team management</strong>
          <span>Only store owners can invite or remove team members. Contact your owner if you need access changes.</span>
        </div>
      )}
    </div>
  );
}
