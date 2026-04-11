package com.example.blogservice.service.impl;

import com.example.blogservice.dto.CommentRequest;
import com.example.blogservice.dto.CommentResponse;
import com.example.blogservice.exception.BlogNotFoundException;
import com.example.blogservice.model.Comment;
import com.example.blogservice.repository.BlogPostRepository;
import com.example.blogservice.repository.CommentRepository;
import com.example.blogservice.service.CommentService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final BlogPostRepository blogPostRepository;

    public CommentServiceImpl(CommentRepository commentRepository, BlogPostRepository blogPostRepository) {
        this.commentRepository = commentRepository;
        this.blogPostRepository = blogPostRepository;
    }

    @Override
    public CommentResponse addComment(UUID blogPostId, String authorId, CommentRequest request) {
        if (!blogPostRepository.existsById(blogPostId)) {
            throw new BlogNotFoundException(blogPostId.toString());
        }

        LocalDateTime now = LocalDateTime.now();
        Comment comment = new Comment();
        comment.setBlogPostId(blogPostId);
        comment.setAuthorId(authorId);
        comment.setContent(request.getContent());
        comment.setCreatedAt(now);
        comment.setUpdatedAt(now);

        return toResponse(commentRepository.save(comment));
    }

    @Override
    public List<CommentResponse> getComments(UUID blogPostId) {
        if (!blogPostRepository.existsById(blogPostId)) {
            throw new BlogNotFoundException(blogPostId.toString());
        }
        return commentRepository.findByBlogPostId(blogPostId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private CommentResponse toResponse(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getBlogPostId(),
                comment.getAuthorId(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}
