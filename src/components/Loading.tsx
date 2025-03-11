import { Hourglass } from 'lucide-react';

const LoadingScreen = ({message}:{message:string}) => {
  return (
    <div className="flex items-center justify-center h-screen flex-col gap-10">
        <Hourglass size={35} className='animate-spin'/>
        <p className=''>{message}</p>
    </div>
  );
};

export default LoadingScreen;
