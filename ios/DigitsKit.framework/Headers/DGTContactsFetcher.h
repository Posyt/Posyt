//
//  DGTContactsFetcher.h
//  DigitsKit
//
//  Copyright © 2016 Twitter Inc. All rights reserved.
//

#import <Foundation/Foundation.h>

@class DGTAddressBookContact;

NS_ASSUME_NONNULL_BEGIN

typedef void (^DGTContactFetchCompletionBlock)(NSArray<DGTAddressBookContact *>  * _Nullable contacts,  NSError * _Nullable error);

/**
 *  A class that is used for fetching contacts from the address book and merging the data
 *  with user information with the digits backend.
 */
@interface DGTContactsFetcher : NSObject

/**
 *  A list of DGTAddressBook contact objects from the most recent fetch request made through
 *  fetchContacts:. This will be an empty array if no request has been made.
 */
@property (nonatomic, strong) NSArray <DGTAddressBookContact *> *contacts;

/**
 *  Fetches a list of contacts from the address book and their states from the digits api.
 *  The result is stored in contacts after the fetch request is made and the same data is
 *  also available in the parameters of DGTContactFetchCompletionBlock. The contacts
 *  parameter in DGTContactFetchCompletionBlock contains a list of contacts with either
 *  a pending, in app or invitable state. If the user has not granted contacts permissions, 
 *  the completion block will pass back an error. The completion block is invoked on the main queue.
 *
 *  @param shouldFetchInAppContactsOnly - A boolean flag that determines if only in app contacts
 *  should be fetched.
 */
- (void)fetchContactsOnlyInApp:(BOOL)shouldFetchInAppContactsOnly
                withCompletion:(DGTContactFetchCompletionBlock)completion;
@end

NS_ASSUME_NONNULL_END