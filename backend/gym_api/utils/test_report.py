import json
import os
from datetime import datetime
from django.conf import settings
from gym_api.users.models import User

class TestReport:
    def __init__(self):
        self.results = []
        self.start_time = datetime.now()
        self.end_time = None

    def add_test_result(self, test_name, status, message=""):
        """Add a test result to the report"""
        self.results.append({
            'test_name': test_name,
            'status': status,
            'message': message,
            'timestamp': datetime.now()
        })

    def save_report(self, output_path):
        """Save the test report as a simple text file"""
        self.end_time = datetime.now()
        duration = (self.end_time - self.start_time).total_seconds()

        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Only include passed tests
        passed_tests = [r for r in self.results if r['status'] == 'PASS']
        
        # Generate simple text report
        report = f"Test Report\n"
        report += f"Start Time: {self.start_time}\n"
        report += f"End Time: {self.end_time}\n"
        report += f"Duration: {duration:.2f} seconds\n\n"
        report += f"Passed Tests ({len(passed_tests)}):\n"
        
        for result in passed_tests:
            report += f"- {result['test_name']}\n"

        # Save the report
        with open(output_path, 'w') as f:
            f.write(report) 