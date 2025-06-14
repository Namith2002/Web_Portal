# Flask Web Portal

A full-stack web portal built with Flask, HTML, CSS, and JavaScript. This project includes common web pages such as home, about, contact, services, login/register, and user profiles.

## Features

- Responsive design that works on desktop and mobile devices
- User authentication system (register, login, logout)
- Contact form with database storage
- User profiles
- Modern UI with interactive elements
- SQLite database for easy setup

## Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

## Installation

1. Clone this repository or download the files

2. Navigate to the project directory

3. Create a virtual environment (recommended):
   ```
   python -m venv venv
   ```

4. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

5. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

## Running the Application

1. Make sure you're in the project directory with the virtual environment activated

2. Run the Flask application:
   ```
   python app.py
   ```

3. Open your web browser and go to:
   ```
   http://127.0.0.1:5000/
   ```

## Project Structure

- `app.py` - Main application file with Flask routes
- `schema.sql` - Database schema definition
- `templates/` - HTML templates
- `static/` - Static files (CSS, JavaScript, images)
  - `css/` - Stylesheet files
  - `js/` - JavaScript files
  - `img/` - Image files

## Database

This project uses SQLite, which is a lightweight disk-based database that doesn't require a separate server process. The database file (`portal.db`) will be automatically created when you first run the application.

## Customization

You can customize this web portal by:

1. Modifying the HTML templates in the `templates/` directory
2. Updating the styles in `static/css/style.css`
3. Adding new routes in `app.py`
4. Extending the database schema in `schema.sql`

## Future Enhancements

- Add more user profile options
- Implement password reset functionality
- Add admin dashboard
- Migrate to a more robust database like PostgreSQL or MySQL for production

## License

This project is open source and available under the MIT License.#   W e b _ P o r t a l  
 