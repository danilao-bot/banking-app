import qrcode
import io
import base64
from sqlalchemy.orm import Session
from models.account import Account
from models.customer import Customer


class QRCodeService:
    @staticmethod
    def generate_account_qr(customer_id: int, db: Session) -> str:
        """Generate QR code for account details"""
        customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
        if not customer or not customer.accounts:
            return None
        
        # Get primary account
        account = customer.accounts[0]
        
        # Create QR data with account details
        qr_data = {
            'bank': 'AETHER',
            'account_name': f'{customer.first_name} {customer.last_name}',
            'account_number': account.account_number,
            'account_type': account.account_type,
            'currency': account.currency,
        }
        
        qr_string = f"AETHER|{customer.first_name} {customer.last_name}|{account.account_number}|{account.account_type}"
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_string)
        qr.make(fit=True)
        
        # Convert to image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_base64}"
