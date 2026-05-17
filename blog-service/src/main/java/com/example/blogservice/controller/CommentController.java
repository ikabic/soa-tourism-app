package com.example.blogservice.controller;

import com.example.blogservice.dto.CommentRequest;
import com.example.blogservice.dto.CommentResponse;
import com.example.blogservice.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/blogs/{blogId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable("blogId") String blogId,
            @Valid @RequestBody CommentRequest request,
            HttpServletRequest httpRequest) {
        String authorId = (String) httpRequest.getAttribute("userId");
        if (authorId == null || authorId.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CommentResponse response = commentService.addComment(blogId, authorId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable("blogId") String blogId) {
        return ResponseEntity.ok(commentService.getComments(blogId));
    }
}
