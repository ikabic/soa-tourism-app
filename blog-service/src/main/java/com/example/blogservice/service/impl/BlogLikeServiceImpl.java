package com.example.blogservice.service.impl;

import com.example.blogservice.exception.AlreadyLikedException;
import com.example.blogservice.exception.BlogNotFoundException;
import com.example.blogservice.exception.NotLikedException;
import com.example.blogservice.model.BlogLike;
import com.example.blogservice.model.BlogPost;
import com.example.blogservice.repository.BlogLikeRepository;
import com.example.blogservice.repository.BlogPostRepository;
import com.example.blogservice.service.BlogLikeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class BlogLikeServiceImpl implements BlogLikeService {

    private final BlogLikeRepository blogLikeRepository;
    private final BlogPostRepository blogPostRepository;

    public BlogLikeServiceImpl(BlogLikeRepository blogLikeRepository, BlogPostRepository blogPostRepository) {
        this.blogLikeRepository = blogLikeRepository;
        this.blogPostRepository = blogPostRepository;
    }

    @Override
    @Transactional
    public void likePost(UUID blogPostId, String userId) {
        BlogPost blogPost = blogPostRepository.findById(blogPostId)
                .orElseThrow(() -> new BlogNotFoundException(blogPostId.toString()));

        if (blogLikeRepository.existsByBlogPostIdAndUserId(blogPostId, userId)) {
            throw new AlreadyLikedException();
        }

        BlogLike like = new BlogLike();
        like.setBlogPostId(blogPostId);
        like.setUserId(userId);
        blogLikeRepository.save(like);

        blogPost.setLikesCount(blogPost.getLikesCount() + 1);
        blogPostRepository.save(blogPost);
    }

    @Override
    @Transactional
    public void unlikePost(UUID blogPostId, String userId) {
        BlogPost blogPost = blogPostRepository.findById(blogPostId)
                .orElseThrow(() -> new BlogNotFoundException(blogPostId.toString()));

        BlogLike like = blogLikeRepository.findByBlogPostIdAndUserId(blogPostId, userId)
                .orElseThrow(NotLikedException::new);

        blogLikeRepository.delete(like);

        blogPost.setLikesCount(Math.max(0, blogPost.getLikesCount() - 1));
        blogPostRepository.save(blogPost);
    }
}
