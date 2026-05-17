package com.example.blogservice.service;

public interface BlogLikeService {
    void likePost(String blogPostId, String userId);
    void unlikePost(String blogPostId, String userId);
    boolean hasLiked(String blogPostId, String userId);
}
