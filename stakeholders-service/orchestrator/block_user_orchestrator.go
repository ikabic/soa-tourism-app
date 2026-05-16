package orchestrator

import (
	saga "saga"
	events "saga/block_user"

	"stakeholders-service.xws.com/model"
)

type BlockUserOrchestrator struct {
	commandPublisher saga.Publisher
	replySubscriber  saga.Subscriber
}

func NewBlockUserOrchestrator(publisher saga.Publisher, subscriber saga.Subscriber) (*BlockUserOrchestrator, error) {
	o := &BlockUserOrchestrator{
		commandPublisher: publisher,
		replySubscriber:  subscriber,
	}
	err := o.replySubscriber.Subscribe(o.handle)
	if err != nil {
		return nil, err
	}
	return o, nil
}

func (o *BlockUserOrchestrator) Start(user *model.User) error {
	event := &events.BlockUserCommand{
		Type: events.BlockUser,
		User: events.UserDetails{
			ID: user.ID,
		},
	}

	return o.commandPublisher.Publish(event)
}

func (o *BlockUserOrchestrator) handle(reply *events.BlockUserReply) {
	command := events.BlockUserCommand{User: reply.User}
	command.Type = o.nextCommandType(reply.Type)
	if command.Type != events.UnknownCommand {
		_ = o.commandPublisher.Publish(command)
	}
}

func (o *BlockUserOrchestrator) nextCommandType(reply events.BlockUserReplyType) events.BlockUserCommandType {
	switch reply {
	case events.UserBlocked:
		return events.ClearFollowRelations
	case events.UserNotBlocked:
		return events.CancelBlock
	case events.BlockRolledBack:
		return events.CancelBlock
	case events.BlockNotRolledBack:
		return events.RollbackBlock

	case events.FollowRelationsCleared:
		return events.ClearCart
	case events.FollowRelationsNotCleared:
		return events.RollbackBlock
	case events.FollowRelationsRolledBack:
		return events.RollbackBlock
	case events.FollowRelationsNotRolledBack:
		return events.RollbackFollowRelations

	case events.CartCleared:
		return events.ConfirmBlock
	case events.CartNotCleared:
		return events.RollbackFollowRelations

	default:
		return events.UnknownCommand
	}
}
