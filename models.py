from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime, date
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    phone_number = db.Column(db.String(20), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    ip_address = db.Column(db.String(100))  # Optional, set at registration
    highlight_id = db.Column(db.Integer)  # Optional, assumed to be an integer
    account_creation = db.Column(db.DateTime, default=datetime.utcnow)
    is_admin = db.Column(db.Boolean, default=False)  # New field to indicate admin status
    is_googleaccount = db.Column(db.Boolean, default=False)  # New field to indicate Google account

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class ProjectView(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    ip_address = db.Column(db.String(100))
    last_viewed = db.Column(db.DateTime)

class Bookmark(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "project_id": self.project_id,
            "timestamp": self.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        }

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

   
class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    descriptionwhy = db.Column(db.String(300), nullable=False)
    public_benefit = db.Column(db.String(300), nullable=False)
    image_file = db.Column(db.String(100), nullable=False)
    geoloc = db.Column(db.String(100))
    date = db.Column(db.DateTime, default=datetime.utcnow)
    author = db.Column(db.String(100), nullable=False)
    is_important = db.Column(db.Boolean, default=False)
    p_reports = db.Column(db.Integer, default=0)
    is_featured = db.Column(db.Boolean, default=False)  # New field
    is_mapobject = db.Column(db.Boolean, default=False)
    is_global = db.Column(db.Boolean, default=False)
    view_count = db.Column(db.Integer, default=0)  # New field for view count

    # Relationships
    votes = db.relationship('Vote', backref='project', lazy=True, cascade="all, delete-orphan")
    comments = db.relationship('Comment', backref='project', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "descriptionwhy": self.descriptionwhy,
            "public_benefit": self.public_benefit,
            "image_file": self.image_file,
            "geoloc": self.geoloc,
            "date": self.date.strftime("%Y-%m-%d %H:%M:%S") if self.date else None,
            "author": self.author,
            "is_important": self.is_important,
            "p_reports": self.p_reports,
            "view_count": self.view_count,
            "is_featured": self.is_featured  # Include new field
        }

class WebsiteViews(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    view_date = db.Column(db.Date, nullable=False)
    ip_address = db.Column(db.String(100), nullable=False)

    @classmethod
    def add_view(cls, ip_address):
        today = date.today()
        existing_view = cls.query.filter_by(view_date=today, ip_address=ip_address).first()
        if not existing_view:
            new_view = cls(view_date=today, ip_address=ip_address)
            db.session.add(new_view)
            db.session.commit()


class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    upvote = db.Column(db.Boolean, default=False)  # Indicates if it's an upvote
    downvote = db.Column(db.Boolean, default=False)  # Indicates if it's a downvote

    
    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "user_id": self.user_id,
            "timestamp": self.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "upvote": self.upvote,
            "downvote": self.downvote
        }
        
class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(300), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    c_reports = db.Column(db.Integer, default=0)  # New field to store report counts

    def to_dict(self):
        return {
            "id": self.id,
            "text": self.text,
            "project_id": self.project_id,
            "user_id": self.user_id,
            "timestamp": self.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "c_reports": self.c_reports  # Include the new field in the dictionary
        }