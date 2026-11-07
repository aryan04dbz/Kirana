"""Initial migration for users and settings.

Revision ID: 0001_initial
Revises:
Create Date: 2026-11-08 03:20:00

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("display_name", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    # Create settings table
    op.create_table(
        "settings",
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("key", sa.String(), nullable=False),
        sa.Column("value", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "key"),
    )

    # Seed default local household user
    users_table = sa.table(
        "users",
        sa.column("id", sa.String),
        sa.column("email", sa.String),
        sa.column("display_name", sa.String),
    )
    op.bulk_insert(
        users_table,
        [
            {
                "id": "default_user",
                "email": "user@kirana.local",
                "display_name": "Local User",
            }
        ],
    )

    # Seed default baseline settings
    settings_table = sa.table(
        "settings",
        sa.column("user_id", sa.String),
        sa.column("key", sa.String),
        sa.column("value", sa.String),
    )
    op.bulk_insert(
        settings_table,
        [
            {"user_id": "default_user", "key": "lookahead_hours", "value": "48"},
            {"user_id": "default_user", "key": "min_order_value", "value": "199"},
            {"user_id": "default_user", "key": "review_buffer_days", "value": "2"},
            {"user_id": "default_user", "key": "max_extend_days", "value": "7"},
        ],
    )


def downgrade() -> None:
    op.drop_table("settings")
    op.drop_table("users")
