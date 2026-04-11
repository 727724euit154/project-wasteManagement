"""Initial Schema

Revision ID: v1_initial
Revises: 
Create Date: 2026-04-10 14:32:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'v1_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Enable PostGIS and UUID
    op.execute('CREATE EXTENSION IF NOT EXISTS postgis;')
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')

    # 2. Roles
    op.execute('''
    CREATE TABLE roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(50) UNIQUE NOT NULL
    );
    ''')

    # 3. Users
    op.execute('''
    CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX idx_users_role ON users(role_id);
    ''')

    # 4. Recycler Locations
    op.execute('''
    CREATE TABLE recycler_locations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        location GEOMETRY(Point, 4326) NOT NULL
    );
    CREATE INDEX idx_recycler_locations_geom ON recycler_locations USING GIST (location);
    CREATE INDEX idx_recycler_locations_user ON recycler_locations(user_id);
    ''')

    # 5. Listings
    op.execute('''
    CREATE TABLE listings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        contractor_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location GEOMETRY(Point, 4326) NOT NULL,
        status VARCHAR(50) DEFAULT 'available',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX idx_listings_geom ON listings USING GIST (location);
    CREATE INDEX idx_listings_contractor ON listings(contractor_id);
    CREATE INDEX idx_listings_status ON listings(status);
    ''')

    # 6. Waste Analysis
    op.execute('''
    CREATE TABLE waste_analysis (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        listing_id UUID REFERENCES listings(id) ON DELETE CASCADE UNIQUE,
        image_url TEXT,
        analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ''')

    # 7. Materials Detected
    op.execute('''
    CREATE TABLE materials_detected (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        analysis_id UUID REFERENCES waste_analysis(id) ON DELETE CASCADE,
        material_type VARCHAR(100) NOT NULL,
        confidence DECIMAL(5, 4) NOT NULL,
        estimated_volume DECIMAL(10, 2) NOT NULL
    );
    CREATE INDEX idx_materials_analysis ON materials_detected(analysis_id);
    CREATE INDEX idx_materials_type ON materials_detected(material_type);
    ''')

    # 8. Reusability Scores
    op.execute('''
    CREATE TABLE reusability_scores (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        analysis_id UUID REFERENCES waste_analysis(id) ON DELETE CASCADE UNIQUE,
        score DECIMAL(5, 2) NOT NULL,
        reasoning TEXT
    );
    ''')

    # 9. Transactions
    op.execute('''
    CREATE TABLE transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        listing_id UUID REFERENCES listings(id) ON DELETE RESTRICT,
        buyer_id UUID REFERENCES users(id) ON DELETE RESTRICT,
        amount DECIMAL(15, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX idx_transactions_listing ON transactions(listing_id);
    CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
    ''')

    # 10. Logistics Requests
    op.execute('''
    CREATE TABLE logistics_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        listing_id UUID REFERENCES listings(id) ON DELETE RESTRICT,
        logistics_partner_id UUID REFERENCES users(id) ON DELETE RESTRICT,
        pickup_location GEOMETRY(Point, 4326) NOT NULL,
        dropoff_location GEOMETRY(Point, 4326) NOT NULL,
        status VARCHAR(50) DEFAULT 'requested',
        requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX idx_logistics_partner ON logistics_requests(logistics_partner_id);
    ''')

    # 11. Waste Passports
    op.execute('''
    CREATE TABLE waste_passports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        listing_id UUID REFERENCES listings(id) UNIQUE ON DELETE RESTRICT,
        origin_id UUID REFERENCES users(id) ON DELETE RESTRICT,
        destination_id UUID REFERENCES users(id) ON DELETE RESTRICT,
        logistics_request_id UUID REFERENCES logistics_requests(id) ON DELETE RESTRICT,
        certification_hash VARCHAR(255) NOT NULL,
        issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ''')

    # 12. Environmental Impact Metrics
    op.execute('''
    CREATE TABLE environmental_impact_metrics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        carbon_saved_kg DECIMAL(15, 2) DEFAULT 0,
        waste_diverted_kg DECIMAL(15, 2) DEFAULT 0,
        calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX idx_environmental_user ON environmental_impact_metrics(user_id);
    ''')


def downgrade() -> None:
    op.execute('DROP TABLE IF EXISTS environmental_impact_metrics CASCADE;')
    op.execute('DROP TABLE IF EXISTS waste_passports CASCADE;')
    op.execute('DROP TABLE IF EXISTS logistics_requests CASCADE;')
    op.execute('DROP TABLE IF EXISTS transactions CASCADE;')
    op.execute('DROP TABLE IF EXISTS reusability_scores CASCADE;')
    op.execute('DROP TABLE IF EXISTS materials_detected CASCADE;')
    op.execute('DROP TABLE IF EXISTS waste_analysis CASCADE;')
    op.execute('DROP TABLE IF EXISTS listings CASCADE;')
    op.execute('DROP TABLE IF EXISTS recycler_locations CASCADE;')
    op.execute('DROP TABLE IF EXISTS users CASCADE;')
    op.execute('DROP TABLE IF EXISTS roles CASCADE;')
