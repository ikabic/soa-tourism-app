package com.example.blogservice.exception;

public class NotLikedException extends RuntimeException {
    public NotLikedException() {
        super("You have not liked this post");
    }
}
