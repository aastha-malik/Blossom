interface FieldNotesProps {
  streak: number;
  tasksCompleted: number;
  petName?: string;
}

function getObservation(streak: number, completed: number, petName: string): string {
  if (streak >= 7) {
    return `${petName} has noticed. Seven days without breaking — she's been sitting up straighter, watching for you at the usual hour.`;
  }
  if (streak >= 3) {
    return `${petName} learned a new trick. If you finish a hard task before noon, she does a little spin. The plot twist I didn't know I needed.`;
  }
  if (completed >= 5) {
    return `A productive spell. ${petName} has been fed well today — full belly, slow blinks, the occasional stretch.`;
  }
  if (completed >= 1) {
    return `One task crossed off is enough to shift the air. ${petName} felt it — she uncurled a little from her corner.`;
  }
  return `${petName} is curled up in the teacup, waiting. The day is still open. That is something.`;
}

export function FieldNotes({ streak, tasksCompleted, petName = 'Mochi' }: FieldNotesProps) {
  return (
    <div style={{
      padding: '14px 16px',
      background: 'var(--card)',
      borderLeft: '3px solid var(--accent-2)',
      marginTop: 16,
    }}>
      <div style={{
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: 10,
        letterSpacing: '2px',
        color: 'var(--muted)',
        textTransform: 'uppercase',
        marginBottom: 4,
      }}>
        FIELD NOTES · TODAY
      </div>
      <div style={{
        fontFamily: 'Fraunces, Georgia, serif',
        fontStyle: 'italic',
        fontSize: 14,
        lineHeight: 1.55,
        color: 'var(--ink)',
      }}>
        {getObservation(streak, tasksCompleted, petName)}
      </div>
    </div>
  );
}
