package block_user

import "github.com/google/uuid"

type UserDetails struct {
	ID uuid.UUID
}

type BlockUserCommandType int8

const (
	BlockUser BlockUserCommandType = iota

	ClearFollowRelations
	ClearCart

	RollbackFollowRelations
	RollbackBlock

	CancelBlock
	ConfirmBlock

	UnknownCommand
)

type BlockUserCommand struct {
	User UserDetails
	Type BlockUserCommandType
}

type BlockUserReplyType int8

const (
	UserBlocked BlockUserReplyType = iota
	UserNotBlocked
	BlockRolledBack
	BlockNotRolledBack

	FollowRelationsCleared
	FollowRelationsNotCleared
	FollowRelationsRolledBack
	FollowRelationsNotRolledBack

	CartCleared
	CartNotCleared

	BlockConfirmed

	UnknownReply
)

type BlockUserReply struct {
	User UserDetails
	Type BlockUserReplyType
}
