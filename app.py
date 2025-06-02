from flask import Flask, render_template, request, redirect, url_for, flash, session, g, abort, jsonify
import sqlite3
import os
import datetime
import secrets
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(16)  # Generate a secure 32-character random hex string
app.config['DATABASE'] = os.path.join(app.root_path, 'portal.db')

# Database initialization
def get_db():
    conn = sqlite3.connect(app.config['DATABASE'])
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

# Admin middleware
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in first', 'warning')
            return redirect(url_for('admin_login'))
        
        # Check both role and is_admin flag for security
        if session.get('user_role') != 'admin' or not session.get('is_admin'):
            flash('You do not have permission to access this page', 'danger')
            return redirect(url_for('home'))
            
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def home():
    return render_template('index.html', title='Home')

@app.route('/about')
def about():
    return render_template('about.html', title='About Us')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        message = request.form['message']
        
        # Save to database
        db = get_db()
        db.execute('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)',
                  [name, email, message])
        db.commit()
        
        flash('Your message has been sent successfully!', 'success')
        return redirect(url_for('contact'))
    
    return render_template('contact.html', title='Contact Us')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        db = get_db()
        user = db.execute('SELECT * FROM users WHERE email = ?', [email]).fetchone()
        
        if user and check_password_hash(user['password'], password):
            # Don't allow admin login through regular login page
            if user['role'] == 'admin':
                flash('Please use the admin login page', 'warning')
                return redirect(url_for('admin_login'))
                
            session.clear()
            session['user_id'] = user['id']
            session['user_role'] = user['role']
            
            flash('You have been logged in successfully!', 'success')
            return redirect(url_for('home'))
        
        flash('Invalid email or password', 'danger')
    
    return render_template('login.html', title='Login')

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    # Redirect if already logged in as admin
    if 'user_id' in session and session.get('user_role') == 'admin':
        return redirect(url_for('admin_dashboard'))
        
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        db = get_db()
        user = db.execute('SELECT * FROM users WHERE email = ? AND role = ?', 
                         [email, 'admin']).fetchone()
        
        if user and check_password_hash(user['password'], password):
            session.clear()
            session['user_id'] = user['id']
            session['user_role'] = user['role']
            session['is_admin'] = True
            
            flash('Admin login successful!', 'success')
            return redirect(url_for('admin_dashboard'))
        
        flash('Invalid admin credentials', 'danger')
    
    return render_template('admin/login.html', title='Admin Login')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        
        db = get_db()
        if db.execute('SELECT id FROM users WHERE email = ?', [email]).fetchone() is not None:
            flash('Email already registered', 'danger')
            return redirect(url_for('register'))
        
        db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                  [name, email, generate_password_hash(password)])
        db.commit()
        
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html', title='Register')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out', 'info')
    return redirect(url_for('home'))

@app.route('/services')
def services():
    return render_template('services.html', title='Our Services')

@app.route('/profile')
def profile():
    if 'user_id' not in session:
        flash('Please log in first', 'warning')
        return redirect(url_for('login'))
    
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE id = ?', [session['user_id']]).fetchone()
    
    return render_template('profile.html', title='My Profile', user=user)

@app.route('/edit-profile', methods=['GET', 'POST'])
def edit_profile():
    if 'user_id' not in session:
        flash('Please log in first', 'warning')
        return redirect(url_for('login'))
    
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE id = ?', [session['user_id']]).fetchone()
    
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        
        # Check if email is already taken by another user
        existing_user = db.execute('SELECT id FROM users WHERE email = ? AND id != ?', 
                                  [email, session['user_id']]).fetchone()
        if existing_user is not None:
            flash('Email already in use by another account', 'danger')
            return redirect(url_for('edit_profile'))
        
        # Update user information
        db.execute('UPDATE users SET name = ?, email = ? WHERE id = ?',
                  [name, email, session['user_id']])
        db.commit()
        
        flash('Profile updated successfully!', 'success')
        return redirect(url_for('profile'))
    
    return render_template('edit_profile.html', title='Edit Profile', user=user)

@app.route('/change-password', methods=['GET', 'POST'])
def change_password():
    if 'user_id' not in session:
        flash('Please log in first', 'warning')
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        current_password = request.form['current_password']
        new_password = request.form['new_password']
        confirm_password = request.form['confirm_password']
        
        # Validate input
        if new_password != confirm_password:
            flash('New passwords do not match', 'danger')
            return redirect(url_for('change_password'))
        
        if len(new_password) < 6:
            flash('Password must be at least 6 characters long', 'danger')
            return redirect(url_for('change_password'))
        
        # Verify current password
        db = get_db()
        user = db.execute('SELECT * FROM users WHERE id = ?', [session['user_id']]).fetchone()
        
        if not check_password_hash(user['password'], current_password):
            flash('Current password is incorrect', 'danger')
            return redirect(url_for('change_password'))
        
        # Update password
        db.execute('UPDATE users SET password = ? WHERE id = ?',
                  [generate_password_hash(new_password), session['user_id']])
        db.commit()
        
        flash('Password updated successfully!', 'success')
        return redirect(url_for('profile'))
    
    return render_template('change_password.html', title='Change Password')

# Admin routes
@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    db = get_db()
    
    # Get statistics for dashboard
    total_users = db.execute('SELECT COUNT(*) as count FROM users').fetchone()['count']
    total_messages = db.execute('SELECT COUNT(*) as count FROM messages').fetchone()['count']
    
    # Get new users in the last 7 days
    one_week_ago = datetime.datetime.now() - datetime.timedelta(days=7)
    one_week_ago_str = one_week_ago.strftime('%Y-%m-%d %H:%M:%S')
    new_users = db.execute('SELECT COUNT(*) as count FROM users WHERE created_at > ?', 
                          [one_week_ago_str]).fetchone()['count']
    
    # Get recent users
    recent_users = db.execute('SELECT * FROM users ORDER BY created_at DESC LIMIT 5').fetchall()
    
    stats = {
        'total_users': total_users,
        'total_messages': total_messages,
        'new_users': new_users
    }
    
    current_date = datetime.datetime.now().strftime('%B %d, %Y')
    
    return render_template('admin/dashboard.html', title='Admin Dashboard', 
                          stats=stats, recent_users=recent_users, current_date=current_date)

@app.route('/admin/users', methods=['GET', 'POST'])
@admin_required
def admin_users():
    db = get_db()
    
    if request.method == 'POST':
        user_id = request.form.get('user_id')
        name = request.form['name']
        email = request.form['email']
        password = request.form.get('password')
        role = request.form['role']
        
        # Check if email is already taken by another user
        if user_id:  # Editing existing user
            existing_user = db.execute('SELECT id FROM users WHERE email = ? AND id != ?', 
                                      [email, user_id]).fetchone()
            if existing_user:
                flash('Email already in use by another account', 'danger')
                return redirect(url_for('admin_users'))
            
            if password and password.strip():  # Update with new password
                db.execute('UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?',
                          [name, email, generate_password_hash(password), role, user_id])
            else:  # Keep existing password
                db.execute('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
                          [name, email, role, user_id])
                
            flash('User updated successfully', 'success')
        else:  # Creating new user
            existing_user = db.execute('SELECT id FROM users WHERE email = ?', [email]).fetchone()
            if existing_user:
                flash('Email already registered', 'danger')
                return redirect(url_for('admin_users'))
            
            if not password or not password.strip():
                flash('Password is required for new users', 'danger')
                return redirect(url_for('admin_users'))
                
            db.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                      [name, email, generate_password_hash(password), role])
            flash('User created successfully', 'success')
            
        db.commit()
        return redirect(url_for('admin_users'))
    
    # Get all users
    users = db.execute('SELECT * FROM users ORDER BY created_at DESC').fetchall()
    
    return render_template('admin/users.html', title='User Management', users=users)

@app.route('/admin/delete-user', methods=['POST'])
@admin_required
def admin_delete_user():
    user_id = request.form.get('user_id')
    
    if not user_id:
        flash('Invalid request', 'danger')
        return redirect(url_for('admin_users'))
    
    # Prevent admin from deleting themselves
    if int(user_id) == session.get('user_id'):
        flash('You cannot delete your own account', 'danger')
        return redirect(url_for('admin_users'))
    
    db = get_db()
    db.execute('DELETE FROM users WHERE id = ?', [user_id])
    db.commit()
    
    flash('User deleted successfully', 'success')
    return redirect(url_for('admin_users'))

@app.route('/admin/messages')
@admin_required
def admin_messages():
    db = get_db()
    messages = db.execute('SELECT * FROM messages ORDER BY created_at DESC').fetchall()
    
    return render_template('admin/messages.html', title='Message Management', messages=messages)

@app.route('/admin/delete-message', methods=['POST'])
@admin_required
def admin_delete_message():
    message_id = request.form.get('message_id')
    
    if not message_id:
        flash('Invalid request', 'danger')
        return redirect(url_for('admin_messages'))
    
    db = get_db()
    db.execute('DELETE FROM messages WHERE id = ?', [message_id])
    db.commit()
    
    flash('Message deleted successfully', 'success')
    return redirect(url_for('admin_messages'))

# Add these imports at the top of the file
import google.generativeai as genai
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get Gemini API key from environment variable
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)

# Initialize the Gemini model - using the correct model name
model = genai.GenerativeModel('gemini-1.5-flash')

# Add this new route for the chatbot
@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.get_json()
    user_message = data.get('message', '')
    
    # Store user message in database if user is logged in
    user_id = session.get('user_id')
    
    try:
        # Generate response using Gemini API
        response = model.generate_content(user_message)
        bot_response = response.text
        
        # Store conversation in database if user is logged in
        if user_id:
            db = get_db()
            db.execute('INSERT INTO chat_history (user_id, user_message, bot_response) VALUES (?, ?, ?)',
                      [user_id, user_message, bot_response])
            db.commit()
        
        return jsonify({'response': bot_response})
    except Exception as e:
        print(f"Error with Gemini API: {str(e)}")
        return jsonify({'response': 'Sorry, I encountered an error. Please try again later.'}), 500

# Add this new admin route to view chat history
@app.route('/admin/chat-history')
@admin_required
def admin_chat_history():
    db = get_db()
    # Join with users table to get user names
    chat_history = db.execute('''
        SELECT ch.id, ch.user_message, ch.bot_response, ch.created_at, u.name as user_name 
        FROM chat_history ch 
        LEFT JOIN users u ON ch.user_id = u.id 
        ORDER BY ch.created_at DESC
    ''').fetchall()
    
    return render_template('admin/chat_history.html', title='Chat History', chat_history=chat_history)

@app.route('/admin/delete-chat', methods=['POST'])
@admin_required
def admin_delete_chat():
    chat_id = request.form.get('chat_id')
    
    if not chat_id:
        flash('Invalid request', 'danger')
        return redirect(url_for('admin_chat_history'))
    
    db = get_db()
    db.execute('DELETE FROM chat_history WHERE id = ?', [chat_id])
    db.commit()
    
    flash('Chat deleted successfully', 'success')
    return redirect(url_for('admin_chat_history'))

# Add this function after init_db function
def migrate_db():
    print('Checking database schema...')
    db = get_db()
    try:
        # Try to query the role column to see if it exists
        db.execute('SELECT role FROM users LIMIT 1')
        print('Role column already exists')
    except sqlite3.OperationalError:
        print('Adding role column to users table...')
        db.execute('ALTER TABLE users ADD COLUMN role TEXT DEFAULT \'user\'')
        db.execute('UPDATE users SET role = \'admin\' WHERE email = \'admin@example.com\'')
        db.commit()
        print('Role column added successfully')

# Then modify the main block to call this function
if __name__ == '__main__':
    if not os.path.exists(app.config['DATABASE']):
        init_db()
        
        # Create an admin user if database is being initialized
        db = get_db()
        admin_exists = db.execute('SELECT id FROM users WHERE email = ?', ['admin@example.com']).fetchone()
        if not admin_exists:
            db.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                      ['Admin User', 'admin@example.com', generate_password_hash('admin123'), 'admin'])
            db.commit()
            print('Admin user created with email: admin@example.com and password: admin123')
    else:
        # Run migration to ensure schema is up to date
        migrate_db()
            
    app.run(debug=True)