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
    <div className="glass-card p-4 flex flex-col max-h-[400px]">
      <h3 className="text-sm font-medium text-foreground mb-3">Live Logs</h3>
      
      <ScrollArea className="flex-1 w-full rounded-md border border-white/10 h-[320px]">
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