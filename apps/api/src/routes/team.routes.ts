import { Router } from 'express';
import { createTeamMember, deleteTeamMember, listTeamMembers, updateTeamMember } from '../controllers/team.controller';
import { authenticate, requireOwner, requireWriteAccess } from '../middleware/auth.middleware';
import { requireSetupComplete } from '../middleware/setup.middleware';

const router = Router();

router.get('/', authenticate, requireSetupComplete, listTeamMembers);
router.post('/', authenticate, requireSetupComplete, requireOwner, createTeamMember);
router.patch('/:id', authenticate, requireSetupComplete, requireOwner, updateTeamMember);
router.delete('/:id', authenticate, requireSetupComplete, requireOwner, deleteTeamMember);

export default router;
