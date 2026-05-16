package handler

import (
	"saga"
	"saga/block_user"

	"followers-service.xws.com/service"
)

type BlockUserCommandHandler struct {
	followService     *service.FollowService
	replyPublisher    saga.Publisher
	commandSubscriber saga.Subscriber
}

func NewBlockUserCommandHandler(followService *service.FollowService, publisher saga.Publisher, subscriber saga.Subscriber) (*BlockUserCommandHandler, error) {
	handler := &BlockUserCommandHandler{
		followService:     followService,
		replyPublisher:    publisher,
		commandSubscriber: subscriber,
	}

	err := handler.commandSubscriber.Subscribe(handler.handle)
	if err != nil {
		return nil, err
	}

	return handler, nil
}

func (handler *BlockUserCommandHandler) handle(cmd *block_user.BlockUserCommand) {
	reply := block_user.BlockUserReply{User: cmd.User}

	switch cmd.Type {

	case block_user.ClearFollowRelations:
		if err := handler.followService.RemoveUserRelations(cmd.User.ID.String()); err != nil {
			reply.Type = block_user.FollowRelationsNotCleared
			break
		}

		reply.Type = block_user.FollowRelationsCleared

	case block_user.RollbackFollowRelations:
		if err := handler.followService.RestoreRelations(cmd.User.ID.String()); err != nil {
			reply.Type = block_user.FollowRelationsNotRolledBack
			break
		}

		reply.Type = block_user.FollowRelationsRolledBack

	case block_user.ConfirmBlock:
		handler.followService.DropSnapshot(cmd.User.ID.String())

	default:
		return
	}

	_ = handler.replyPublisher.Publish(reply)
}
