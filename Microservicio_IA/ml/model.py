import torch
import torch.nn as nn
import torch.nn.functional as F

CLASSES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'decimal']
NUM_CLASSES = len(CLASSES)

class DigitCNN(nn.Module):
    """
    PARTE 6 — PYTORCH PARA LOS DÍGITOS
    CNN liviana y eficiente para clasificar dígitos 0-9 y punto decimal (11 clases).
    Entrada: imagen en escala de grises de 1x28x28.
    """
    def __init__(self, num_classes=NUM_CLASSES):
        super(DigitCNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        self.pool = nn.MaxPool2d(2, 2)
        self.dropout1 = nn.Dropout(0.25)
        
        self.fc1 = nn.Linear(64 * 7 * 7, 128)
        self.dropout2 = nn.Dropout(0.5)
        self.fc2 = nn.Linear(128, num_classes)

    def forward(self, x):
        # x: [batch, 1, 28, 28]
        x = self.pool(F.relu(self.bn1(self.conv1(x))))  # [batch, 32, 14, 14]
        x = self.pool(F.relu(self.bn2(self.conv2(x))))  # [batch, 64, 7, 7]
        x = self.dropout1(x)
        
        x = x.view(-1, 64 * 7 * 7)
        x = F.relu(self.fc1(x))
        x = self.dropout2(x)
        x = self.fc2(x)
        return x

def get_class_name(idx):
    if 0 <= idx < len(CLASSES):
        return CLASSES[idx]
    return "?"
