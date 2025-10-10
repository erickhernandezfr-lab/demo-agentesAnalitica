
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface AgentCardProps {
  title: string;
  description: string;
  status: 'Active' | 'Ready' | 'Pending';
  kpi: string;
  ctaText: string;
  ctaLink: string;
  icon: React.ReactNode;
}

export function AgentCard({ title, description, status, kpi, ctaText, ctaLink, icon }: AgentCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          {icon}
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <Badge variant={status === 'Active' ? 'default' : 'outline'}>{status}</Badge>
            <p className="text-sm text-muted-foreground mt-2">{kpi}</p>
          </div>
          <Link href={ctaLink} legacyBehavior passHref>
            <Button asChild>
              <a>{ctaText}</a>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
