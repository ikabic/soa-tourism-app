package orchestrator

import (
	"log"
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

	log.Printf("Starting BlockUser saga for %s", user.ID.String())

	return o.commandPublisher.Publish(event)
}

func (o *BlockUserOrchestrator) handle(reply *events.BlockUserReply) {
	command := events.BlockUserCommand{User: reply.User}

	log.Printf("Saga reply %v type for user %s", reply.Type, reply.User.ID)

	command.Type = o.nextCommandType(reply.User.ID.String(), reply.Type)
	if command.Type != events.UnknownCommand {
		_ = o.commandPublisher.Publish(command)
	}
}

func (o *BlockUserOrchestrator) nextCommandType(userID string, reply events.BlockUserReplyType) events.BlockUserCommandType {
	switch reply {
	case events.UserBlocked:
		log.Printf("User %s's status set to blocked and profile anonymized", userID)
		return events.ClearFollowRelations
	case events.UserNotBlocked:
		log.Printf("Failed to set user %s's status to blocked or annonymize profile, saga aborted", userID)
		return events.CancelBlock
	case events.BlockRolledBack:
		log.Printf("User %s's status and profile successfully rolled back, saga aborted", userID)
		return events.CancelBlock
	case events.BlockNotRolledBack:
		log.Printf("Failed to rollback user %s's profile, reattempting rollback", userID)
		return events.RollbackBlock

	case events.FollowRelationsCleared:
		log.Printf("Successfully cleaned up user %s's follow relationships", userID)
		return events.ClearCart
	case events.FollowRelationsNotCleared:
		log.Printf("Follow relationships clean up failed for user %s, rolling back", userID)
		return events.RollbackBlock
	case events.FollowRelationsRolledBack:
		log.Printf("Rolled back follow relationships for user %s", userID)
		return events.RollbackBlock
	case events.FollowRelationsNotRolledBack:
		log.Printf("Failed to rollback user %s's follow relationships, reattempting rollback", userID)
		return events.RollbackFollowRelations

	case events.CartCleared:
		log.Printf("Cleared user %s's shopping cart", userID)
		return events.ConfirmBlock
	case events.CartNotCleared:
		log.Printf("Failed to clear user %s's shopping cart, rolling back", userID)
		return events.RollbackFollowRelations

	default:
		return events.UnknownCommand
	}
}
