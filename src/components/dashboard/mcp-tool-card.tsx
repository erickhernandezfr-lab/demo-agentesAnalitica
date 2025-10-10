
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export type ToolStatus = 'Idle' | 'Running' | 'Completed' | 'Failed' | 'Pending' | 'Not Started';

interface McpToolCardProps {
  toolName: string;
  status: ToolStatus;
  lastRun?: string;
  onActionClick: () => void;
  actionText: string;
  disabled: boolean;
  children?: React.ReactNode;
}

const statusVariant: Record<ToolStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Idle': 'secondary',
    'Running': 'default',
    'Completed': 'default',
    'Failed': 'destructive',
    'Pending': 'outline',
    'Not Started': 'outline',
};


export function McpToolCard({
  toolName,
  status,
  lastRun,
  onActionClick,
  actionText,
  disabled,
  children,
}: McpToolCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{toolName}</CardTitle>
          <Badge variant={statusVariant[status]}>{status}</Badge>
        </div>
        {lastRun && (
          <CardDescription>Last run: {lastRun}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {children}
        <div className="flex justify-end mt-4">
          <Button onClick={onActionClick} size="sm" disabled={disabled}>{actionText}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
