//
//  DGTInviteFlowConfiguration.h
//  DigitsKit
//
//  Created by Yong Mao on 9/12/16.
//  Copyright © 2016 Twitter Inc. All rights reserved.
//

#import <Foundation/Foundation.h>

@class DGTAddressBookContact;
@class DGTBranchConfiguration;

typedef NS_ENUM(NSInteger, DGTInAppButtonState) {
    DGTInAppButtonStateNormal = 0,
    DGTInAppButtonStateActive = 1
};

typedef void (^DGTInAppInviteUserAction)(NSString *phoneNumber, NSString *digitsID, DGTInAppButtonState state);
typedef NSString* (^DGTSMSTextBlock)(DGTAddressBookContact *contact, NSString *inviteUrl);

@interface DGTInviteFlowConfiguration : NSObject

// required field to be used when the invites feature needs to display the app's name in the UI
@property (nonatomic, copy, readonly) NSString *appDisplayName;

// override it to specify the title of the invite view
@property (nonatomic, copy, readwrite) NSString *inviteViewTitle;

// override it to specify the text to be used for invite button
@property (nonatomic, copy, readwrite) NSString *inviteButtonTitle;

/**
 *  Set this, the inAppButtonAction and the inAppButtonPressedTitle for the 
 *  button to be visible in the list of contacts that already exist in the app.
 */
@property (nonatomic, copy, readwrite) NSString *inAppButtonTitle;

/**
 *  Set this, the inAppButtontitle and the inAppButtonAction for the
 *  button to be visible in the list of contacts that are already in the app.
 */
@property (nonatomic, copy, readwrite) NSString *inAppButtonPressedTitle;

/**
 *  Action block that is called when the user presses the action button associated 
 *  with contacts currently in the application. This, the inAppButtonTitle and the
 *  inAppButtonPressedTitle must be set for the button to be visible.
 */
@property (nonatomic, copy, readwrite) DGTInAppInviteUserAction inAppButtonAction;

/**
 *  A set of properties that are configurable if the Branch framework is integrated
 *  into your project. This must be set in order for the branchLink parameter in
 *  smsTextPrefillText to return a valid url.
 */
@property (nonatomic, copy, readwrite) DGTBranchConfiguration *branchConfig;

/**
 *  Determines the prefill text of the sms that is sent when the MFMessageComposeViewController 
 *  is presented. The DGTSMSTextBlock takes two parameters: a DGTAddressBookContact and an 
 *  invite URL. The return type of the block is an NSString. The invite URL will be nil unless 
 *  the Branch framework is integrated into your project and the branchConfig parameter is also 
 *  set. The default implementation of the DGTGSMSBlock is a localized string that accomodates 
 *  for the case where the invite URL is nil.
 */
@property (nonatomic, copy, readwrite) DGTSMSTextBlock smsPrefillText;

- (instancetype)initWithAppName:(NSString *)appDisplayName;

- (instancetype)init __attribute__((unavailable("Use -initWithAppName:inviteText: instead")));

@end
