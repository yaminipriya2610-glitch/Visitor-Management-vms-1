import qrcode

booking_code = "VIS-20261030-EC79C8"
img = qrcode.make(booking_code)
img.save("visitor_pass.png")

print("QR Code generated successfully!")