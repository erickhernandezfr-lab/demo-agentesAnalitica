
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Button } from '@/components/ui/button';

interface JobProgressProps {
  jobId: string;
}

const JobProgress: React.FC<JobProgressProps> = ({ jobId }) => {
  const [value, loading, error] = useDocumentData(doc(firestore, 'jobs', jobId));

  if (loading) {
    return <p>Loading job status...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!value) {
    return null;
  }

  const { status, pdfUrl } = value;

  return (
    <div>
      <h3>Job Status: {status}</h3>
      {status === 'pending' && <p>Your job is pending...</p>}
      {status === 'analyzing' && <p>Analyzing website...</p>}
      {status === 'generating_pdf' && <p>Generating PDF report...</p>}
      {status === 'completed' && (
        <div>
          <p>Your report is ready!</p>
          <Button asChild>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              Download Report
            </a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default JobProgress;
