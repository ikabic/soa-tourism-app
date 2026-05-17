import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/blogApi';
import { api as stakeholdersApi } from '../api/stakeholdersApi';
import { api as followersApi } from '../api/followersApi';
import { Btn, ErrBanner, Icon, ICONS, ProfileUsername } from '../components';
import { formatDate } from '../utils/helpers';
import ReactMarkdown from 'react-markdown';
import BlockRequestModal from '../components/BlockRequestModal';

export default function BlogDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [formError, setFormError] = useState(null);

  const { data: blog, isLoading: blogLoading, error: blogError } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => api.getBlog(id, token),
    enabled: !!token,
  });

  const { data: canReadData, isLoading: canReadLoading } = useQuery({
    queryKey: ['can-read-blog', blog?.authorId],
    queryFn: () => followersApi.canReadBlog(blog.authorId, token),
    enabled: !!blog?.authorId && !!token,
  });

  const canRead = canReadData?.canRead ?? false;
  const isOwnBlog = blog?.authorId === user?.userId;

  const { data: authorProfile } = useQuery({
     queryKey: ['author-profile-single', blog?.authorId],
     queryFn: async () => {
       const result = await stakeholdersApi.getProfiles(blog.authorId);
       if (Array.isArray(result)) return result[0] ?? null;
       return result ?? null;
     },
     enabled: !!blog?.authorId && !!token,
     staleTime: 60_000,
  });

  const authorUsername = authorProfile?.username ?? authorProfile?.Username ?? null;

  const { data: comments = [], isLoading: commentsLoading, error: commentsError } = useQuery({
    queryKey: ['blog-comments', id],
    queryFn: () => api.getComments(id, token),
    enabled: !!token,
  });

  const authorIds = useMemo(() => {
    const ids = new Set();
    if (blog?.authorId) ids.add(blog.authorId);
    if (comments?.length) {
      comments.forEach((comment) => {
        if (comment.authorId) ids.add(comment.authorId);
      });
    }
    return [...ids];
  }, [blog?.authorId, comments]);

  const { data: authorProfiles = [] } = useQuery({
    queryKey: ['blog-authors', authorIds],
    queryFn: () => stakeholdersApi.getProfiles(authorIds.join(',')),
    enabled: authorIds.length > 0,
    staleTime: 1000 * 60,
  });

  const authorById = useMemo(() => {
    const map = new Map();
    authorProfiles.forEach((profile) => map.set(profile.id, profile.username));
    return map;
  }, [authorProfiles]);

  const authorName = blog?.authorId ? (authorById.get(blog.authorId) || blog.authorId) : '';

  const { data: likeStatus } = useQuery({
    queryKey: ['blog-like-status', id],
    queryFn: () => api.getLikeStatus(id, token),
    enabled: !!token,
    refetchOnMount: 'always',
  });

  const [currentLiked, setCurrentLiked] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setCurrentLiked(null);
  }, [id, token]);

  useEffect(() => {
    if (likeStatus && typeof likeStatus.liked === 'boolean') {
      setCurrentLiked(likeStatus.liked);
    }
  }, [likeStatus]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const images = blog?.imageUrls?.split(',').map((url) => url.trim()).filter(Boolean) || [];
  const likes = blog?.likesCount ?? 0;

  useEffect(() => {
    if (images.length === 0) {
      setActiveImageIndex(0);
      return;
    }
    if (activeImageIndex >= images.length) {
      setActiveImageIndex(0);
    }
  }, [images.length, activeImageIndex]);

  const liked = currentLiked !== null ? currentLiked : likeStatus?.liked === true;

  const likeMutation = useMutation({
    mutationFn: () => api.likeBlog(id, token),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['blog-like-status', id] });
      await queryClient.cancelQueries({ queryKey: ['blog', id] });

      const previousLikeStatus = queryClient.getQueryData(['blog-like-status', id]);
      const previousBlog = queryClient.getQueryData(['blog', id]);

      queryClient.setQueryData(['blog-like-status', id], { liked: true });
      setCurrentLiked(true);
      queryClient.setQueryData(['blog', id], (old) => old ? { ...old, likesCount: (old.likesCount ?? 0) + 1 } : old);
      queryClient.setQueryData(['blogs'], (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((blogItem) => blogItem.id === id
          ? { ...blogItem, likesCount: (blogItem.likesCount ?? 0) + 1 }
          : blogItem);
      });

      return { previousLikeStatus, previousBlog };
    },
    onError: (err, _, context) => {
      if (context?.previousLikeStatus) {
        queryClient.setQueryData(['blog-like-status', id], context.previousLikeStatus);
        setCurrentLiked(context.previousLikeStatus.liked);
      }
      if (context?.previousBlog) {
        queryClient.setQueryData(['blog', id], context.previousBlog);
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['blog', id] }),
        queryClient.invalidateQueries({ queryKey: ['blog-like-status', id] }),
        queryClient.invalidateQueries({ queryKey: ['blogs'] }),
      ]);
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () => api.unlikeBlog(id, token),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['blog-like-status', id] });
      await queryClient.cancelQueries({ queryKey: ['blog', id] });

      const previousLikeStatus = queryClient.getQueryData(['blog-like-status', id]);
      const previousBlog = queryClient.getQueryData(['blog', id]);

      queryClient.setQueryData(['blog-like-status', id], { liked: false });
      setCurrentLiked(false);
      queryClient.setQueryData(['blog', id], (old) => old ? { ...old, likesCount: Math.max(0, (old.likesCount ?? 1) - 1) } : old);
      queryClient.setQueryData(['blogs'], (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((blogItem) => blogItem.id === id
          ? { ...blogItem, likesCount: Math.max(0, (blogItem.likesCount ?? 1) - 1) }
          : blogItem);
      });

      return { previousLikeStatus, previousBlog };
    },
    onError: (err, _, context) => {
      if (context?.previousLikeStatus) {
        queryClient.setQueryData(['blog-like-status', id], context.previousLikeStatus);
        setCurrentLiked(context.previousLikeStatus.liked);
      }
      if (context?.previousBlog) {
        queryClient.setQueryData(['blog', id], context.previousBlog);
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['blog', id] }),
        queryClient.invalidateQueries({ queryKey: ['blog-like-status', id] }),
        queryClient.invalidateQueries({ queryKey: ['blogs'] }),
      ]);
    },
  });

  const commentMutation = useMutation({
    mutationFn: (payload) => api.addComment(id, payload, token),
    onSuccess: async () => {
      setCommentText('');
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: ['blog-comments', id] });
    },
    onError: (error) => {
      setFormError(error.message || 'Could not post comment.');
    },
  });

  function handleCommentSubmit(e) {
    e.preventDefault();
    setFormError(null);
    if (!commentText.trim()) {
      return setFormError('Comment cannot be empty.');
    }
    commentMutation.mutate({ content: commentText.trim() });
  }

  if (blogLoading) return <div className="container" style={{ padding: 40 }}>Loading blog…</div>;
  if (blogError) return <div className="container" style={{ padding: 40 }}><ErrBanner>{blogError.message}</ErrBanner></div>;

 

  return (
    <div className="container" style={{ padding: '40px 0 80px' }}>
      <div className="row between" style={{ marginBottom: 18 }}>
        <div>
          <span className="eyebrow">Blog</span>
          <h1 style={{ marginTop: 6 }}>{blog.title}</h1>
          <div className="row gap-8 wrap" style={{ marginTop: 10, color: 'var(--ink-faint)', fontSize: 13 }}>
            <span>{formatDate(blog.createdAt)}</span>
            <span>·</span>
            <span>by&nbsp;<ProfileUsername username={authorName} isInline={true} color='var(--ink-faint)' /></span>
            <span>·</span>
            <span>{likes} like{likes !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="row gap-8 wrap" style={{ alignItems: 'center' }}>
          <Btn
            variant={liked ? 'primary' : 'ghost'}
            onClick={() => liked ? unlikeMutation.mutate() : likeMutation.mutate()}
            disabled={likeMutation.isPending || unlikeMutation.isPending}
            style={{ color: liked ? 'var(--paper)' : undefined }}
          >
            <Icon
              d={ICONS.heart}
              size={16}
              fill={liked ? 'currentColor' : 'none'}
              style={{ marginRight: 6 }}
            />
            {liked ? 'Unlike' : 'Like'}
          </Btn>
          <Link to="/blogs">
            <Btn variant="quiet">Back to posts</Btn>
          </Link>
        </div>
      </div>

      <div className="card fade-up text-break blog-markdown" style={{ padding: 22, marginBottom: 26, overflowWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal' }}>
        <ReactMarkdown>{blog.description}</ReactMarkdown>
      </div>

      {images.length > 0 && (
        <div className="col" style={{ gap: 16, marginBottom: 34, alignItems: 'stretch' }}>
          <span className="eyebrow" style={{ marginBottom: 10, alignSelf: 'flex-start' }}>Images</span>
          <div style={{ position: 'relative', width: '100%', maxWidth: 760, margin: '0 auto', borderRadius: 18, overflow: 'hidden', background: 'var(--paper-deep)', boxShadow: '0 12px 30px rgba(0,0,0,0.06)' }}>
            <img
              src={images[activeImageIndex]}
              alt={`Blog image ${activeImageIndex + 1}`}
              style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }}
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(0,0,0,0.55)',
                    color: 'white',
                    fontSize: 24,
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                    transition: 'background 0.2s ease',
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(0,0,0,0.55)',
                    color: 'white',
                    fontSize: 24,
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                    transition: 'background 0.2s ease',
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="row gap-10" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    border: 'none',
                    background: idx === activeImageIndex ? 'var(--ink)' : 'var(--ink-faint)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="row between" style={{ marginBottom: 14, alignItems: 'center' }}>
        <div>
          <span className="eyebrow">Comments</span>
          <p className="muted" style={{ margin: '4px 0 0' }}>Add your thoughts and reply to the community.</p>
        </div>
      </div>

      {formError && <div style={{ marginBottom: 16 }}><ErrBanner onClose={() => setFormError(null)}>{formError}</ErrBanner></div>}

      <form className="card p-20 fade-up" onSubmit={handleCommentSubmit} style={{ marginBottom: 24 }}>
        <div className="field">
          <label className="field-label">New comment</label>
          <textarea className="input" rows={5} value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment…" />
        </div>
        <div className="row gap-12" style={{ flexWrap: 'wrap', marginTop: 12 }}>
          <Btn type="submit" variant="primary" disabled={commentMutation.isPending}>Post comment</Btn>
          <span className="faint">Comments are visible to everyone who reads this post.</span>
        </div>
      </form>

      {commentsLoading ? (
        <div className="container" style={{ padding: 24 }}><p>Loading comments…</p></div>
      ) : comments.length === 0 ? (
        <div className="empty">
          <h3>No comments yet</h3>
          <p>Be the first to respond.</p>
        </div>
      ) : (
        <div className="col gap-14">
          {comments.map((comment) => (
            <div key={comment.id} className="card fade-up" style={{ padding: 18 }}>
              <div className="row between" style={{ marginBottom: 10, gap: 12, alignItems: 'center' }}>
                <div>
                  <ProfileUsername username={authorById.get(comment.authorId) || comment.authorId} isInline={true} />
                  <div className="faint" style={{ fontSize: 12 }}>{formatDate(comment.createdAt)}{comment.updatedAt && comment.updatedAt !== comment.createdAt ? ' · edited' : ''}</div>
                </div>
              </div>
              <p className="text-break" style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {!isOwnBlog && !canRead && !canReadLoading && <BlockRequestModal icon={ICONS.lock} title={'Follow to read'} message={<> This blog is written by <strong>{authorUsername || 'this author'}</strong>. You need to follow them to read their posts.</>}
        onClose={() => navigate('/blogs')} cancelLabel={'Back to blogs'} onConfirm={() => navigate(`/${authorUsername}`)} confirmLabel={'View profile'} />}
    </div>
  );
}
