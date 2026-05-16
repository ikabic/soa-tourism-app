package handler

import (
	"example.com/purchase-service/service"
	"saga"
	"saga/archive_tour"
)

type ArchiveTourCommandHandler struct {
	purchaseService   *service.PurchaseService
	replyPublisher    saga.Publisher
	commandSubscriber saga.Subscriber
}

func NewArchiveTourCommandHandler(purchaseService *service.PurchaseService, publisher saga.Publisher, subscriber saga.Subscriber) (*ArchiveTourCommandHandler, error) {
	handler := &ArchiveTourCommandHandler{
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

func (handler *ArchiveTourCommandHandler) handle(cmd *archive_tour.ArchiveTourCommand) {
	reply := archive_tour.ArchiveTourReply{Tour: cmd.Tour}

	switch cmd.Type {

	case archive_tour.ClearTourFromCarts:
		if err := handler.purchaseService.RemoveCartItemForEveryone(cmd.Tour.ID); err != nil {
			reply.Type = archive_tour.TourFromCartsNotCleared
			break
		}

		reply.Type = archive_tour.TourFromCartsCleared

	default:
		return
	}

	_ = handler.replyPublisher.Publish(reply)
}
