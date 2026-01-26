import { useState, useEffect } from 'react';
import { Send, MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { addComment, deleteComment, getCommentsForSurvey } from '@/app/utils/engagement';
import { getCurrentUserId } from '@/app/utils/profile';
import type { Comment } from '@/app/types/survey';

interface CommentsSectionProps {
  surveyId: string;
}

export function CommentsSection({ surveyId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    loadComments();
  }, [surveyId]);

  const loadComments = () => {
    const loadedComments = getCommentsForSurvey(surveyId);
    setComments(loadedComments);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addComment(surveyId, newComment.trim());
    setNewComment('');
    loadComments();
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId);
    loadComments();
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 font-bold mb-3 hover:bg-gray-100 px-2 py-1"
        style={{ boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.3)' }}
      >
        <MessageCircle className="h-4 w-4" />
        <span>Comments ({comments.length})</span>
      </button>

      {isExpanded && (
        <div className="space-y-3">
          {/* Add Comment */}
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddComment();
                  }
                }}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 focus:outline-none"
                style={{ boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.3)' }}
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 font-bold"
                style={{ backgroundColor: '#FFED00', boxShadow: '3px 4px 0px rgba(0, 0, 0, 0.3)' }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-2">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3"
                  style={{ boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.3)' }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-sm mb-1">
                        {comment.userName}
                        {comment.userId === currentUserId && (
                          <span className="ml-2 text-xs font-normal text-gray-500">(You)</span>
                        )}
                      </p>
                      <p className="text-sm">{comment.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {comment.userId === currentUserId && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="ml-2 p-1 hover:bg-gray-100"
                        title="Delete comment"
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  );
}