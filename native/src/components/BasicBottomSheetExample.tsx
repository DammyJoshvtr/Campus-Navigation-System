import { useState } from 'react';
import { Host, BottomSheet, Button, Text, VStack } from '@expo/ui/swift-ui';

export default function BasicBottomSheetExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <Button label="Open Sheet" onPress={() => setIsPresented(true)} />
        <BottomSheet isPresented={isPresented} onIsPresentedChange={setIsPresented}>
          <Text>Hello, world!</Text>
        </BottomSheet>
      </VStack>
    </Host>
  );
}
