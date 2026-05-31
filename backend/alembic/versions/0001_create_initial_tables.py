"""create initial tables

Revision ID: 0001_create_initial_tables
Revises: 
Create Date: 2026-05-10

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0001_create_initial_tables'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────────────────────────────
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clerk_user_id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('country', sa.String(), nullable=True),
        sa.Column('university', sa.String(), nullable=True),
        sa.Column('whatsapp_number', sa.String(), nullable=True),
        sa.Column('is_onboarded', sa.Boolean(), nullable=True, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('clerk_user_id'),
    )
    op.create_index(op.f('ix_users_clerk_user_id'), 'users', ['clerk_user_id'], unique=True)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=False)

    # ── comparisons ────────────────────────────────────────────────────────────
    op.create_table(
        'comparisons',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clerk_user_id', sa.String(), nullable=True),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('from_currency', sa.String(), nullable=False),
        sa.Column('to_currency', sa.String(), nullable=False),
        sa.Column('results_json', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ['clerk_user_id'], ['users.clerk_user_id'],
            ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('id'),
    )

    # ── rate_alerts ────────────────────────────────────────────────────────────
    op.create_table(
        'rate_alerts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('clerk_user_id', sa.String(), nullable=False),
        sa.Column('from_currency', sa.String(), nullable=False),
        sa.Column('to_currency', sa.String(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('target_rate', sa.Float(), nullable=False),
        sa.Column('provider', sa.String(), nullable=True),
        sa.Column('notify_email', sa.Boolean(), nullable=True, default=True),
        sa.Column('notify_whatsapp', sa.Boolean(), nullable=True, default=False),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.Column('last_triggered', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ['clerk_user_id'], ['users.clerk_user_id'],
            ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('rate_alerts')
    op.drop_table('comparisons')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_clerk_user_id'), table_name='users')
    op.drop_table('users')
