import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WorkspaceCanvas from '../flow/WorkspaceCanvas';

export default function WorkspacePage() {
  const { circuitId } = useParams<{ circuitId?: string }>();
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col">
      <AppBar position="static" color="primary">
        <Toolbar className="flex justify-between" variant="dense">
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}>
            لوحة التحكم
          </Button>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            ⚡️ PhasorX Workspace
          </Typography>
        </Toolbar>
      </AppBar>

      <div className="flex-1 min-h-0">
        <ReactFlowProvider>
          <WorkspaceCanvas circuitId={circuitId} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
