import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { toast } from 'react-toastify';
import { fetchMembers, fetchInvites, disableOrg, enableOrg, setUserActive, revokeInvite, createInvite } from '@/api/org';

const OrgAdmin = () => {
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [disableConfirmOpen, setDisableConfirmOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState('staff');
  const [inviteExpiresDays, setInviteExpiresDays] = useState('7');

  const orgCode = useMemo(() => localStorage.getItem('orgCode') || '', []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersData, invitesData] = await Promise.all([
        fetchMembers({ page: 1, limit: 50, ...(role ? { role } : {}), ...(search ? { search } : {}) }),
        fetchInvites(),
      ]);
      setMembers(membersData?.members || []);
      setInvites(invitesData?.invites || []);
    } catch (error) {
      // handled by global interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUser = async (user) => {
    try {
      const updated = await setUserActive(user.id || user._id, !user.active);
      setMembers((prev) =>
        prev.map((m) => (m._id === updated._id ? { ...m, active: updated.active } : m))
      );
      toast.success(`User ${updated.active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      // handled by interceptor
    }
  };

  const handleDisableOrg = async () => {
    try {
      await disableOrg();
      toast.success('Organization disabled');
    } catch (error) {
      // handled by interceptor
    }
  };

  const handleRevokeInvite = async (code) => {
    try {
      await revokeInvite(code);
      setInvites((prev) => prev.filter((invite) => invite.code !== code));
      toast.success('Invite revoked');
    } catch (error) {
      // handled by interceptor
    }
  };

  const handleEnableOrg = async () => {
    try {
      await enableOrg();
      toast.success('Organization enabled');
      await loadData();
    } catch (error) {
      // handled by interceptor
    }
  };

  const handleCreateInvite = async () => {
    try {
      const days = Number(inviteExpiresDays);
      const expiresAt = Number.isFinite(days) && days > 0
        ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
        : undefined;
      const created = await createInvite({ role: inviteRole, expiresAt });
      setInvites((prev) => [{ ...created, createdBy: 'You' }, ...prev]);
      if (created?.code && navigator?.clipboard?.writeText) {
        const inviteLink = `${window.location.origin}/register?invite=${created.code}`;
        navigator.clipboard.writeText(inviteLink);
        toast.success('Invite created. Link copied to clipboard.');
      } else {
        toast.success('Invite created.');
      }
    } catch (error) {
      // handled by interceptor
    }
  };

  const copyOrgCode = () => {
    if (!orgCode) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(orgCode);
      toast.info('Org code copied');
    }
  };

  return (
    <Box>
      <Box mb={3} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Organization Admin</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage members, invites, and org status
          </Typography>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button variant="outlined" onClick={handleEnableOrg}>Enable Org</Button>
          <Button variant="contained" color="error" onClick={() => setDisableConfirmOpen(true)}>
            Disable Org
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>Organization Code</Typography>
            <Typography variant="body2" color="text.secondary">Share this with members to join.</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip label={orgCode || 'N/A'} color="primary" variant="outlined" />
            <Button size="small" variant="outlined" onClick={copyOrgCode} disabled={!orgCode}>
              Copy
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={2}>
          <Typography variant="subtitle1" fontWeight={600}>Members</Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search members"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="technician">Technician</MenuItem>
                <MenuItem value="vendor">Vendor</MenuItem>
              </Select>
            </FormControl>
            <Button size="small" variant="outlined" onClick={loadData}>
              Apply
            </Button>
          </Box>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member._id}>
                <TableCell>{member.firstName} {member.lastName}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={member.active ? 'Active' : 'Inactive'}
                    color={member.active ? 'success' : 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleToggleUser(member)}
                    disabled={loading}
                  >
                    {member.active ? 'Deactivate' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && members.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">
                    No members found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={2}>
          <Typography variant="subtitle1" fontWeight={600}>Invites</Typography>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <MenuItem value="facility_manager">Facility Manager</MenuItem>
                <MenuItem value="technician">Technician</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="vendor">Vendor</MenuItem>
                <MenuItem value="finance">Finance</MenuItem>
                <MenuItem value="procurement">Procurement</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Expires (days)"
              type="number"
              value={inviteExpiresDays}
              onChange={(e) => setInviteExpiresDays(e.target.value)}
              inputProps={{ min: 1 }}
              sx={{ width: 140 }}
            />
            <Button size="small" variant="contained" onClick={handleCreateInvite}>
              Create Invite
            </Button>
          </Box>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invites.map((invite) => (
              <TableRow key={invite.code}>
                <TableCell>{invite.code}</TableCell>
                <TableCell>{invite.role}</TableCell>
                <TableCell>{invite.createdBy || '—'}</TableCell>
                <TableCell>{invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : '—'}</TableCell>
                <TableCell align="right">
                  <Box display="flex" justifyContent="flex-end" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        if (navigator?.clipboard?.writeText) {
                          const inviteLink = `${window.location.origin}/register?invite=${invite.code}`;
                          navigator.clipboard.writeText(inviteLink);
                          toast.info('Invite link copied');
                        }
                      }}
                    >
                      Copy
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleRevokeInvite(invite.code)}
                    >
                      Revoke
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {!loading && invites.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">
                    No active invites found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={disableConfirmOpen} onClose={() => setDisableConfirmOpen(false)}>
        <DialogTitle>Disable organization?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Disabling the organization will deactivate all users and block access until re-enabled.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisableConfirmOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              setDisableConfirmOpen(false);
              await handleDisableOrg();
            }}
          >
            Disable
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrgAdmin;
