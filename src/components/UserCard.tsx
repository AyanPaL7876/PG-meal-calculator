import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import Image from "next/image";

interface UserCardProps {
  user: {
    name: string;
    email: string;
    photoURL?: string;
    role?: string;
    joinedAt?: string;
    requestedAt?: string;
    status?: string;
  };
  onAction?: (userId: string, action: 'accept' | 'reject') => void;
  isRequest?: boolean;
}

export default function UserCard({ user, onAction, isRequest = false }: UserCardProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 group">
      <CardContent className="p-4 sm:p-6">
        {/* Mobile Layout (Stack) */}
        <div className="flex flex-col items-center space-y-4 sm:hidden">
          {/* Avatar */}
          <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-blue-500/20 group-hover:border-blue-500/40 transition-all duration-300">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                <span className="text-2xl text-blue-400">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="text-center space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 group-hover:to-pink-400 transition-colors">
              {user.name}
            </h3>
            <p className="text-gray-400 font-medium tracking-wide text-sm sm:text-base">
              {user.email}
            </p>
            <p className="text-gray-500 text-sm font-medium">
              {isRequest 
                ? `Requested: ${format(new Date(user.requestedAt || ''), 'PPP')}`
                : `Joined: ${format(new Date(user.joinedAt || ''), 'PPP')}`
              }
            </p>
          </div>

          {/* Action Buttons */}
          {isRequest && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onAction?.(user.email, 'accept')}
                className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20 border border-green-500/20 hover:border-green-500/40 text-green-400 rounded-lg transition-all duration-300 text-sm sm:text-base"
              >
                Accept
              </button>
              <button
                onClick={() => onAction?.(user.email, 'reject')}
                className="px-4 py-2 bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg transition-all duration-300 text-sm sm:text-base"
              >
                Reject
              </button>
            </div>
          )}
        </div>

        {/* Desktop Layout (Grid) */}
        <div className="hidden sm:grid grid-cols-[auto_1fr_auto] gap-6 items-center">
          {/* Avatar */}
          <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-blue-500/20 group-hover:border-blue-500/40 transition-all duration-300">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                <span className="text-2xl text-blue-400">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 group-hover:to-pink-400 transition-colors">
              {user.name}
            </h3>
            <p className="text-gray-400 font-medium tracking-wide">
              {user.email}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              
              <span className="text-gray-500 text-sm font-medium">
                {isRequest 
                  ? `Requested: ${format(new Date(user.requestedAt || ''), 'PPP')}`
                  : `Joined: ${format(new Date(user.joinedAt || ''), 'PPP')}`
                }
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {isRequest && (
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => onAction?.(user.email, 'accept')}
                className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20 border border-green-500/20 hover:border-green-500/40 text-green-400 rounded-lg transition-all duration-300 whitespace-nowrap"
              >
                Accept
              </button>
              <button
                onClick={() => onAction?.(user.email, 'reject')}
                className="px-4 py-2 bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg transition-all duration-300 whitespace-nowrap"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 