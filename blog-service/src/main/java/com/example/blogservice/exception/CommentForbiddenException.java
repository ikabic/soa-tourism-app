package com.example.blogservice.exception;

public class CommentForbiddenException extends RuntimeException {
	public CommentForbiddenException() {
        super("You must follow this author to comment on their blog");
    }
}
