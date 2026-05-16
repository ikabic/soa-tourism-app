package handler

import (
	"saga"
	"saga/block_user"

	"example.com/purchase-service/service"
)

type BlockUserCommandHandler struct {
	purchaseService   *service.PurchaseService
	replyPublisher    saga.Publisher
	commandSubscriber saga.Subscriber
}

func NewBlockUserCommandHandler(purchaseService *service.PurchaseService, publisher saga.Publisher, subscriber saga.Subscriber) (*BlockUserCommandHandler, error) {
	handler := &BlockUserCommandHandler{
		purchaseService:   purchaseService,
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

	case block_user.ClearCart:
		if err := handler.purchaseService.ClearCart(cmd.User.ID); err != nil {
			reply.Type = block_user.CartNotCleared
			break
		}

		reply.Type = block_user.CartCleared

	default:
		return
	}

	_ = handler.replyPublisher.Publish(reply)
}
