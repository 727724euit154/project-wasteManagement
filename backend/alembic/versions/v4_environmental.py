"""environmental_impact

Revision ID: v4_environmental
Revises: v3_logistics_payment
Create Date: 2026-04-10 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = 'v4_environmental'
down_revision = 'v3_logistics_payment'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('environmental_impact_metrics', sa.Column('listing_id', UUID(as_uuid=True), sa.ForeignKey("listings.id", ondelete="CASCADE"), nullable=True))
    op.add_column('environmental_impact_metrics', sa.Column('co2_reduction_kg', sa.Numeric(precision=15, scale=2), server_default='0', nullable=True))
    op.add_column('environmental_impact_metrics', sa.Column('energy_saved_kwh', sa.Numeric(precision=15, scale=2), server_default='0', nullable=True))
    op.add_column('environmental_impact_metrics', sa.Column('total_waste_reused_kg', sa.Numeric(precision=15, scale=2), server_default='0', nullable=True))
    op.add_column('environmental_impact_metrics', sa.Column('landfill_waste_avoided_kg', sa.Numeric(precision=15, scale=2), server_default='0', nullable=True))

def downgrade() -> None:
    op.drop_column('environmental_impact_metrics', 'landfill_waste_avoided_kg')
    op.drop_column('environmental_impact_metrics', 'total_waste_reused_kg')
    op.drop_column('environmental_impact_metrics', 'energy_saved_kwh')
    op.drop_column('environmental_impact_metrics', 'co2_reduction_kg')
    op.drop_column('environmental_impact_metrics', 'listing_id')
