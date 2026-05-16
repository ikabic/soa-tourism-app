package archive_tour

import "github.com/google/uuid"

type TourDetails struct {
	ID uuid.UUID
}

type ArchiveTourCommandType int8

const (
	ArchiveTour ArchiveTourCommandType = iota

	ClearTourFromCarts

	RollbackTourArchiving

	CancelArchive
	ConfirmArchive

	UnknownCommand
)

type ArchiveTourCommand struct {
	Tour TourDetails
	Type ArchiveTourCommandType
}

type ArchiveTourReplyType int8

const (
	TourArchived ArchiveTourReplyType = iota
	TourNotArchived
	ArchiveRolledBack
	ArchiveNotRolledBack

	TourFromCartsCleared
	TourFromCartsNotCleared

	ArchiveConfirmed

	UnknownReply
)

type ArchiveTourReply struct {
	Tour TourDetails
	Type ArchiveTourReplyType
}
