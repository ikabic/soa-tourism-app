package com.example.blogservice.service;

import java.util.UUID;

public interface BlogLikeService {
    void likePost(UUID blogPostId, String userId);
    void unlikePost(UUID blogPostId, String userId);
    boolean hasLiked(UUID blogPostId, String userId);
}
