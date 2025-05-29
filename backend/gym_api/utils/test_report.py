import json
import os
from datetime import datetime
from django.conf import settings

class TestReport:
    def __init__(self):
        self.report_dir = os.path.join(settings.BASE_DIR, 'test_reports')
        self.ensure_directories()
        self.current_report = {
            'timestamp': datetime.now().isoformat(),
            'tests': [],
            'summary': {
                'total': 0,
                'passed': 0,
                'failed': 0,
                'errors': 0
            },
            'features': {
                'completed': [],
                'in_progress': [],
                'not_implemented': []
            }
        }

    def ensure_directories(self):
        """Ensure report directory exists"""
        if not os.path.exists(self.report_dir):
            os.makedirs(self.report_dir)

    def add_feature_status(self, feature_name, status, description=None):
        """Add feature status"""
        feature_info = {
            'name': feature_name,
            'description': description
        }
        if status == 'completed':
            self.current_report['features']['completed'].append(feature_info)
        elif status == 'in_progress':
            self.current_report['features']['in_progress'].append(feature_info)
        else:
            self.current_report['features']['not_implemented'].append(feature_info)

    def add_test_result(self, test_name, status, message=None, data=None):
        """Add test result"""
        test_result = {
            'name': test_name,
            'status': status,
            'timestamp': datetime.now().isoformat(),
            'message': message,
            'data': data
        }
        self.current_report['tests'].append(test_result)
        
        # Update statistics
        self.current_report['summary']['total'] += 1
        if status == 'passed':
            self.current_report['summary']['passed'] += 1
        elif status == 'failed':
            self.current_report['summary']['failed'] += 1
        elif status == 'error':
            self.current_report['summary']['errors'] += 1

    def save_report(self):
        """Save test report"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = os.path.join(self.report_dir, f'test_report_{timestamp}.json')
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.current_report, f, ensure_ascii=False, indent=2)
        
        return report_file

    def generate_html_report(self):
        """Generate HTML test report"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        html_file = os.path.join(self.report_dir, f'test_report_{timestamp}.html')
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Test Report - {timestamp}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .section {{ margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }}
                .summary {{ background-color: #f5f5f5; padding: 20px; border-radius: 5px; }}
                .test-case {{ margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }}
                .passed {{ background-color: #e6ffe6; }}
                .failed {{ background-color: #ffe6e6; }}
                .error {{ background-color: #fff2e6; }}
                .data {{ background-color: #f8f9fa; padding: 10px; border-radius: 3px; }}
                .feature-list {{ list-style-type: none; padding: 0; }}
                .feature-item {{ margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <h1>Project Test Report</h1>
            
            <div class="section">
                <h2>1. Project Overview</h2>
                <p>This project is a gym management system that provides comprehensive member management, course management, and trainer management functionalities.</p>
            </div>

            <div class="section">
                <h2>2. Feature Overview</h2>
                <h3>Completed Features</h3>
                <ul class="feature-list">
        """
        
        for feature in self.current_report['features']['completed']:
            html_content += f"""
                <li class="feature-item">
                    <h4>{feature['name']}</h4>
                    <p>{feature['description']}</p>
                </li>
            """

        html_content += """
                </ul>
                <h3>Features In Progress</h3>
                <ul class="feature-list">
        """
        
        for feature in self.current_report['features']['in_progress']:
            html_content += f"""
                <li class="feature-item">
                    <h4>{feature['name']}</h4>
                    <p>{feature['description']}</p>
                </li>
            """

        html_content += """
                </ul>
                <h3>Not Implemented Features</h3>
                <ul class="feature-list">
        """
        
        for feature in self.current_report['features']['not_implemented']:
            html_content += f"""
                <li class="feature-item">
                    <h4>{feature['name']}</h4>
                    <p>{feature['description']}</p>
                </li>
            """

        html_content += """
                </ul>
            </div>

            <div class="section">
                <h2>3. Test Results</h2>
                <div class="summary">
                    <h3>Test Summary</h3>
                    <p>Total Tests: {self.current_report['summary']['total']}</p>
                    <p>Passed: {self.current_report['summary']['passed']}</p>
                    <p>Failed: {self.current_report['summary']['failed']}</p>
                    <p>Errors: {self.current_report['summary']['errors']}</p>
                </div>
                <h3>Detailed Results</h3>
        """
        
        for test in self.current_report['tests']:
            status_class = test['status']
            html_content += f"""
            <div class="test-case {status_class}">
                <h4>{test['name']}</h4>
                <p>Status: {test['status']}</p>
                <p>Time: {test['timestamp']}</p>
            """
            
            if test['message']:
                html_content += f"<p>Message: {test['message']}</p>"
            
            if test['data']:
                html_content += f"""
                <div class="data">
                    <h5>Test Data:</h5>
                    <pre>{json.dumps(test['data'], ensure_ascii=False, indent=2)}</pre>
                </div>
                """
            
            html_content += "</div>"
        
        html_content += """
            </div>

            <div class="section">
                <h2>4. Installation and Running Guide</h2>
                <h3>Requirements</h3>
                <ul>
                    <li>Python 3.8+</li>
                    <li>Django 4.2+</li>
                    <li>PostgreSQL 12+</li>
                </ul>
                
                <h3>Installation Steps</h3>
                <ol>
                    <li>Clone the repository</li>
                    <li>Create virtual environment</li>
                    <li>Install dependencies: pip install -r requirements.txt</li>
                    <li>Configure database</li>
                    <li>Run migrations: python manage.py migrate</li>
                    <li>Start server: python manage.py runserver</li>
                </ol>
            </div>
        </body>
        </html>
        """
        
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return html_file 