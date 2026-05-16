package handler

import (
	"log"
	saga "saga"
	"saga/block_user"

	"stakeholders-service.xws.com/service"
)

type BlockUserCommandHandler struct {
	userService       *service.UserService
	profileService    *service.ProfileService
	replyPublisher    saga.Publisher
	commandSubscriber saga.Subscriber
}

func NewBlockUserCommandHandler(userService *service.UserService, profileService *service.ProfileService, publisher saga.Publisher, subscriber saga.Subscriber) (*BlockUserCommandHandler, error) {
	handler := &BlockUserCommandHandler{
		userService:       userService,
		profileService:    profileService,
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

	case block_user.BlockUser:
		if err := handler.userService.SetBlocked(cmd.User.ID, true); err != nil {
			reply.Type = block_user.UserNotBlocked
			break
		}

		if err := handler.profileService.AnonymizeProfile(cmd.User.ID); err != nil {
			handler.userService.SetBlocked(cmd.User.ID, false)
			reply.Type = block_user.UserNotBlocked
			break
		}

		reply.Type = block_user.UserBlocked

	case block_user.RollbackBlock:
		if err := handler.userService.SetBlocked(cmd.User.ID, false); err != nil {
			reply.Type = block_user.BlockNotRolledBack
			break
		}

		if err := handler.profileService.RestoreProfile(cmd.User.ID); err != nil {
			reply.Type = block_user.BlockNotRolledBack
			break
		}

		reply.Type = block_user.BlockRolledBack

	case block_user.ConfirmBlock:
		log.Printf("User block saga confirmed for user %s", cmd.User.ID.String())
		handler.profileService.DropSnapshot(cmd.User.ID)
		return

	default:
		return
	}

	_ = handler.replyPublisher.Publish(reply)
}
