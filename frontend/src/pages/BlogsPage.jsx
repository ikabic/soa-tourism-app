import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/blogApi';
import { api as stakeholdersApi } from '../api/stakeholdersApi';
import { Btn, ErrBanner, Icon, ICONS } from '../components';
import { formatDate } from '../utils/helpers';
import ReactMarkdown from 'react-markdown';

export default function BlogsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [layout, setLayout] = useState('grid');

  const { data: blogs = [], isLoading, error } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => api.getBlogs(token),
    enabled: !!token,
  });

  const authorIds = useMemo(() => {
    return [...new Set(blogs?.map((blog) => blog.authorId).filter(Boolean))];
  }, [blogs]);

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

  const filteredBlogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return blogs
      .filter((blog) => {
        if (!query) return true;
        return [
          blog.title,
          blog.description,
          authorById.get(blog.authorId) || '',
        ].some((value) => value?.toLowerCase().includes(query));
      })
      .slice()
      .sort((a, b) => {
        if (sortBy === 'likes') {
          return (b.likesCount ?? 0) - (a.likesCount ?? 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
  }, [blogs, authorById, searchTerm, sortBy]);

  const createMutation = useMutation({
    mutationFn: (payload) => api.createBlog(payload, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      setTitle('');
      setDescription('');
      selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setSelectedImages([]);
      setErr(null);
      setSuccess('Blog post created successfully.');
    },
    onError: (error) => {
      setErr(error.message || 'Could not create blog post.');
      setSuccess(null);
    },
  });

  function handleImageFilesChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const nextImages = files.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((prev) => [...prev, ...nextImages]);
    e.target.value = '';
  }

  function handleRemoveImage(imageId) {
    setSelectedImages((prev) => {
      const next = prev.filter((image) => image.id !== imageId);
      const removed = prev.find((image) => image.id === imageId);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(null);
    setSuccess(null);
    if (!title.trim() || !description.trim()) {
      return setErr('Title and description are required.');
    }

    const imageList = [];
    if (selectedImages.length > 0) {
      try {
        const uploadResults = await Promise.all(
          selectedImages.map((image) => api.uploadBlogImage(image.file, token))
        );
        uploadResults.forEach((uploadResult) => {
          if (uploadResult?.url) {
            imageList.push(uploadResult.url);
          }
        });
      } catch (uploadError) {
        return setErr(uploadError.message || 'Image upload failed.');
      }
    }

    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      imageUrls: imageList,
    });
  }

  if (isLoading) return <div className="container" style={{ padding: 40 }}>Loading…</div>;
  if (error) return <div className="container" style={{ padding: 40 }}><ErrBanner>{error.message}</ErrBanner></div>;

  return (
    <div className="container" style={{ padding: '40px 0 80px' }}>
      <div style={{ marginBottom: 26 }}>
        <span className="eyebrow">Blog</span>
        <h1 style={{ marginTop: 6 }}>Stories from the community</h1>
        <p className="muted" style={{ marginTop: 6, maxWidth: 620 }}>
          Read, create, comment and like blog posts created by users. Use markdown in the description to format your story.
        </p>
      </div>

      <div className="card p-20 fade-up" style={{ marginBottom: 24 }}>
        <div className="row between" style={{ marginBottom: 20 }}>
          <div>
            <span className="eyebrow">Create a post</span>
            <h2 style={{ marginTop: 4 }}>Share a story</h2>
          </div>
          <Btn
            variant={showCreateForm ? 'ghost' : 'primary'}
            icon={showCreateForm ? undefined : 'plus'}
            onClick={() => {
              setShowCreateForm((prev) => !prev);
              setSuccess(null);
              setErr(null);
            }}
          >
            {showCreateForm ? 'Cancel' : 'New post'}
          </Btn>
        </div>

        {err && <div style={{ marginBottom: 16 }}><ErrBanner onClose={() => setErr(null)}>{err}</ErrBanner></div>}
        {success && <div style={{ marginBottom: 16 }}><div className="card card-warm p-16">{success}</div></div>}

        {showCreateForm ? (
          <>
            <form className="col gap-16" onSubmit={handleSubmit}>
              <div className="field">
                <label className="field-label">Title</label>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blog title" />
              </div>

              <div className="field">
                <label className="field-label">Description (Markdown supported)</label>
                <textarea className="input" rows={8} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write your blog content using markdown." />
              </div>

              <div className="field">
                <label className="field-label">Upload images (optional)</label>
                <input type="file" accept="image/*" multiple onChange={handleImageFilesChange} />
                {selectedImages.length > 0 && (
                  <div className="row wrap" style={{ gap: 12, marginTop: 12 }}>
                    {selectedImages.map((image) => (
                      <div key={image.id} style={{ position: 'relative', width: 140, height: 104, borderRadius: 14, overflow: 'hidden', border: '0.5px solid var(--sage-line)' }}>
                        <img
                          src={image.previewUrl}
                          alt="Selected preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(image.id)}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            cursor: 'pointer',
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="row gap-12" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Btn type="submit" variant="primary" disabled={createMutation.isLoading}>
                  {createMutation.isLoading ? 'Posting…' : 'Publish post'}
                </Btn>
                <span className="faint">Need help with markdown? Use headings, bold, links, and lists.</span>
              </div>
            </form>

            {description.trim() ? (
              <div style={{ marginTop: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Preview</div>
                <div className="card" style={{ padding: 18, background: 'var(--paper-deep)', border: '0.5px solid var(--sage-line)' }}>
                  <ReactMarkdown>{description}</ReactMarkdown>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <p className="muted" style={{ marginTop: 10 }}>
            Click &quot;New post&quot; to open the write form when you are ready.
          </p>
        )}
      </div>

      <div className="card p-16 fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 12, alignItems: 'center', marginBottom: 24 }}>
        <div style={{ position: 'relative' }}>
          <Icon d={ICONS.search} size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)' }} />
          <input
            className="input"
            placeholder="Search by title, content, or author…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>
        <div className="row gap-4" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <label className="faint" style={{ fontSize: 13, marginRight: 6 }}>Sort</label>
          {[
            ['date', 'Date'],
            ['likes', 'Likes'],
            ['title', 'Title'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSortBy(value)}
              className={`btn ${sortBy === value ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="row gap-4">
          <button onClick={() => setLayout('grid')} className={`btn ${layout === 'grid' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>
            <Icon d="M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z" size={14} />
          </button>
          <button onClick={() => setLayout('list')} className={`btn ${layout === 'list' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>
            <Icon d="M3 6h18M3 12h18M3 18h18" size={14} />
          </button>
        </div>
        <span className="faint" style={{ fontSize: 13 }}>{filteredBlogs.length} post{filteredBlogs.length !== 1 ? 's' : ''}</span>
      </div>

      {filteredBlogs.length === 0 ? (
        <div className="empty">
          <h3>No posts found</h3>
          <p>Try a different keyword or clear the filters.</p>
        </div>
      ) : layout === 'list' ? (
        <div className="col gap-18">
          {filteredBlogs.map((blog, index) => (
            <BlogCard key={blog.id} blog={blog} index={index} authorById={authorById} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {filteredBlogs.map((blog, index) => (
            <BlogCard key={blog.id} blog={blog} index={index} authorById={authorById} />
          ))}
        </div>
      )}
    </div>
  );
}

function BlogCard({ blog, index, authorById }) {
  const excerpt = blog.description?.split('\n')[0] || '';
  const imageUrls = blog.imageUrls ? blog.imageUrls.split(',').map((url) => url.trim()).filter(Boolean) : [];

  const authorName = authorById.get(blog.authorId) || blog.authorId;

  return (
    <div className="card p-20 fade-up" style={{ animationDelay: `${index * 40}ms` }}>
      <div className="row between" style={{ gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row gap-8 wrap" style={{ alignItems: 'center', marginBottom: 10 }}>
            <span className="eyebrow">{formatDate(blog.createdAt)}</span>
            <span className="faint">by {authorName}</span>
            <span className="faint">{blog.likesCount ?? 0} likes</span>
          </div>
          <h3 style={{ margin: 0 }}>{blog.title}</h3>
          <p className="muted" style={{ marginTop: 10, lineHeight: 1.6 }}>{excerpt.length > 180 ? `${excerpt.slice(0, 180)}…` : excerpt}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {imageUrls.length > 0 ? (
            <img src={imageUrls[0]} alt={blog.title} style={{ width: 124, height: 92, objectFit: 'cover', borderRadius: 12 }} />
          ) : (
            <div style={{ width: 124, height: 92, borderRadius: 12, background: 'var(--paper-deep)', display: 'grid', placeItems: 'center', color: 'var(--ink-faint)' }}>
              No image
            </div>
          )}
        </div>
      </div>
      <div className="row" style={{ marginTop: 18, justifyContent: 'flex-end' }}>
        <Link to={`/blogs/${blog.id}`}>
          <Btn variant="primary" iconRight="chevR">Read post</Btn>
        </Link>
      </div>
    </div>
  );
}
