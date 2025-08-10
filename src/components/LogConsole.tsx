import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';

interface LogConsoleProps {
  logs: string[];
}

export function LogConsole({ logs }: LogConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="glass-card p-4 space-y-3">
      <h3 className="text-sm font-medium text-foreground">Live Logs</h3>
      
      <ScrollArea className="h-64 w-full rounded-md border border-white/10">
        <div ref={scrollRef} className="p-3 space-y-1 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-muted-foreground italic">
              Waiting for migration to start...
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`
                  ${log.includes('❌') ? 'text-destructive' : ''}
                  ${log.includes('✓') || log.includes('🎉') ? 'text-accent' : ''}
                  ${log.includes('Executing') || log.includes('Running') ? 'text-processing' : ''}
                  ${!log.includes('❌') && !log.includes('✓') && !log.includes('🎉') && !log.includes('Executing') && !log.includes('Running') ? 'text-muted-foreground' : ''}
                `}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}