package com.example.blogservice.grpc;

import follow.FollowServiceGrpc;
import follow.FollowServiceProto.IsFollowingRequest;
import follow.FollowServiceProto.IsFollowingResponse;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class FollowersGrpcClient {

    private final ManagedChannel channel;
    private final FollowServiceGrpc.FollowServiceBlockingStub stub;

    public FollowersGrpcClient(@Value("${followers.grpc.host}") String host, @Value("${followers.grpc.port}") int port) {
        this.channel = ManagedChannelBuilder
                .forAddress(host, port)
                .usePlaintext()
                .build();
        this.stub = FollowServiceGrpc.newBlockingStub(channel);
    }

    public boolean isFollowing(String followerId, String followedId) {
        IsFollowingResponse response = stub.isFollowing(
                IsFollowingRequest.newBuilder()
                        .setFollowerId(followerId)
                        .setFollowedId(followedId)
                        .build()
        );
        return response.getIsFollowing();
    }

    @PreDestroy
    public void shutdown() {
        channel.shutdown();
    }
}