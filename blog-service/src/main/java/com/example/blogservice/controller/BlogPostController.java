package com.example.blogservice.controller;

import com.example.blogservice.dto.BlogPostRequest;
import com.example.blogservice.model.BlogPost;
import com.example.blogservice.repository.BlogPostRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/blogs")
public class BlogPostController {

    private final BlogPostRepository blogPostRepository;

    public BlogPostController(BlogPostRepository blogPostRepository) {
        this.blogPostRepository = blogPostRepository;
    }

    @GetMapping
    public List<BlogPost> getAllBlogs() {
        return blogPostRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogPost> getBlogById(@PathVariable UUID id) {
        Optional<BlogPost> blogPost = blogPostRepository.findById(id);
        return blogPost.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<BlogPost> createBlog(@Valid @RequestBody BlogPostRequest request, HttpServletRequest httpRequest) {
        String authorId = (String) httpRequest.getAttribute("userId");
        if (authorId == null || authorId.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        BlogPost blogPost = new BlogPost();
        blogPost.setTitle(request.getTitle());
        blogPost.setDescription(request.getDescription());
        blogPost.setAuthorId(authorId);
        blogPost.setCreatedAt(LocalDateTime.now());
        blogPost.setLikesCount(0);

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            blogPost.setImageUrls(String.join(",", request.getImageUrls()));
        }

        BlogPost saved = blogPostRepository.save(blogPost);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
