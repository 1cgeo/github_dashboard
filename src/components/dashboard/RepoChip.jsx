// Path: components\dashboard\RepoChip.jsx
import React from 'react';
import { Link, Chip, Tooltip } from '@mui/material';
import { Lock } from '@mui/icons-material';

const PRIVATE_TOOLTIP = 'Repositório privado: o link só abre para quem tem acesso no GitHub';

// Chip do repositório, com link para o GitHub. Quando o repo é privado,
// mostra um cadeado e destaque "warning" para avisar que o link pode dar 404
// para quem não tem acesso.
function RepoChip({ repo, repoUrl, isPrivate = false, sx }) {
  const chip = (
    <Chip
      label={repo}
      size="small"
      variant="outlined"
      color={isPrivate ? 'warning' : 'default'}
      icon={isPrivate ? <Lock /> : undefined}
      sx={sx}
    />
  );

  return (
    <Link href={repoUrl} target="_blank" rel="noopener">
      {isPrivate ? <Tooltip title={PRIVATE_TOOLTIP}>{chip}</Tooltip> : chip}
    </Link>
  );
}

export default RepoChip;
